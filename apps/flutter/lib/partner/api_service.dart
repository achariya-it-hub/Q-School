import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'models.dart';

class PartnerApiService {
  // Singleton pattern
  static final PartnerApiService _instance = PartnerApiService._internal();
  factory PartnerApiService() => _instance;
  PartnerApiService._internal();

  /// Default API base URL. Can be adjusted for physical device testing.
  String _baseUrl = defaultBaseUrl();

  static String defaultBaseUrl() {
    // Override for local testing: flutter run --dart-define=API_BASE=http://localhost:3000
    return const String.fromEnvironment('API_BASE', defaultValue: 'https://erp.theqschool.com');
  }

  String get baseUrl => _baseUrl;
  void setBaseUrl(String url) {
    _baseUrl = url.replaceAll(RegExp(r'/+$'), '');
  }

  // ── Session token (set by every sign-in; sent on later calls) ──────────────
  String? _token;
  String? get token => _token;
  void setToken(String? t) => _token = (t == null || t.isEmpty) ? null : t;
  void signOut() => _token = null;

  Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Map<String, dynamic> _json(http.Response res) {
    try {
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw Exception('Server error (${res.statusCode}). Please try again.');
    }
  }

  Map<String, dynamic> _signedIn(Map<String, dynamic> data) {
    setToken(data['token']?.toString() ?? data['partnerToken']?.toString());
    return {
      'partner': Partner.fromJson(data['partner']),
      'admissions': (data['admissions'] as List? ?? []).map((a) => PartnerAdmission.fromJson(a)).toList(),
      'needsPassword': data['needsPassword'] == true,
    };
  }

  /// Sign in with mobile number (or email) + password
  Future<Map<String, dynamic>> loginWithPassword(String identifier, String password) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/partners/auth'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'identifier': identifier.trim(), 'password': password}),
    );
    final data = _json(res);
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Sign-in failed');
    }
    return _signedIn(data);
  }

  /// One-time sign-in for existing partners who only have a referral code.
  /// The app must then make them set a password.
  Future<Map<String, dynamic>> loginWithCode(String code) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/partners/auth'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'code': code.trim().toUpperCase()}),
    );
    final data = _json(res);
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Partner verification failed');
    }
    return _signedIn(data);
  }

  /// Set (or change) the sign-in password. `currentPassword` is required when one already exists.
  Future<void> setPassword({required String newPassword, String? currentPassword}) async {
    final res = await http.post(
      Uri.parse('$_baseUrl/api/partners/password'),
      headers: _headers(),
      body: jsonEncode({'newPassword': newPassword, if (currentPassword != null) 'currentPassword': currentPassword}),
    );
    final data = _json(res);
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Could not set the password');
    }
    setToken(data['token']?.toString());
  }

  /// Authenticate/lookup partner by verified Google OAuth tokens
  Future<Map<String, dynamic>> loginWithGoogle({
    String? idToken,
    String? accessToken,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/partners/auth');
    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'idToken': idToken,
        'accessToken': accessToken,
      }),
    );

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 404 && data['notRegistered'] == true) {
      return {
        'notRegistered': true,
        'email': data['email'],
      };
    }
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Partner Google sign-in failed');
    }

    setToken(data['token']?.toString());
    final partner = Partner.fromJson(data['partner']);
    final admissionsList = (data['admissions'] as List? ?? [])
        .map((a) => PartnerAdmission.fromJson(a))
        .toList();

    return {
      'notRegistered': false,
      'partner': partner,
      'admissions': admissionsList,
    };
  }

  /// Make direct student admission (persists to ERP students.json & CRM)
  Future<Map<String, dynamic>> submitAdmission(NewAdmissionRequest req) async {
    final uri = Uri.parse('$_baseUrl/api/partners/admissions');
    final res = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode(req.toJson()),
    );

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Admission submission failed');
    }

    final admission = PartnerAdmission.fromJson(data['admission']);
    final studentId = data['studentId'] as String;

    return {
      'studentId': studentId,
      'admission': admission,
      'isDuplicate': data['isDuplicateStudent'] == true,
    };
  }

  /// Fetch partner's admissions history
  Future<List<PartnerAdmission>> fetchAdmissions(String partnerCode) async {
    final uri = Uri.parse('$_baseUrl/api/partners/admissions?code=${Uri.encodeComponent(partnerCode)}');
    final res = await http.get(uri, headers: _headers());

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Could not fetch admissions');
    }

    final list = (data['admissions'] as List? ?? [])
        .map((a) => PartnerAdmission.fromJson(a))
        .toList();
    return list;
  }

  /// Register a new partner (self-service signup)
  Future<Map<String, dynamic>> signupPartner({
    required String name,
    required String phone,
    required String email,
    String? organization,
    String? category,
    String? centreId,
    String? upiId,
    String? requestedCode,
    String? password,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/partners/signup');
    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name.trim(),
        'phone': phone.trim(),
        'email': email.trim().toLowerCase(),
        'organization': organization?.trim() ?? '',
        'category': category ?? 'Education Consultant',
        'centreId': centreId ?? 'all',
        'upiId': upiId?.trim() ?? '',
        'code': requestedCode?.trim().toUpperCase() ?? '',
        'password': password ?? '',
      }),
    );

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Partner registration failed');
    }

    setToken(data['token']?.toString());
    final partner = Partner.fromJson(data['partner']);
    return {
      'partner': partner,
      'admissions': <PartnerAdmission>[],
    };
  }

  /// Update partner payout bank details
  Future<Partner> updateBankDetails({
    required String code,
    required PartnerBankDetails bankDetails,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/partners/profile');
    final res = await http.patch(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'code': code,
        'bankDetails': bankDetails.toJson(),
      }),
    );

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Could not save bank details');
    }

    return Partner.fromJson(data['partner']);
  }

  /// Authenticate Student, Teacher, or Admin credentials against ERP Admin-approved accounts
  Future<Map<String, dynamic>> loginMobileUser({
    required String identifier,
    required String password,
    required String role,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/mobile/auth/login');
    final res = await http
        .post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'identifier': identifier.trim(),
            'password': password.trim(),
            'role': role,
          }),
        )
        .timeout(const Duration(seconds: 12));

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(
        data['error'] ??
            'Account not found or pending Q-School Admin approval. Only Partners can self-register.',
      );
    }

    return data['user'] as Map<String, dynamic>;
  }
}
