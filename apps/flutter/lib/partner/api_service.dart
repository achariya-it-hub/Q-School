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
    return 'https://erp.theqschool.com';
  }

  String get baseUrl => _baseUrl;
  void setBaseUrl(String url) {
    _baseUrl = url.replaceAll(RegExp(r'/+$'), '');
  }

  /// Authenticate/lookup partner by referral code
  Future<Map<String, dynamic>> loginWithCode(String code) async {
    final cleanCode = code.trim().toUpperCase();
    final uri = Uri.parse('$_baseUrl/api/partners/auth');
    try {
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'code': cleanCode}),
      );

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      if (res.statusCode != 200 || data['ok'] != true) {
        throw Exception(data['error'] ?? 'Partner verification failed');
      }

      final partner = Partner.fromJson(data['partner']);
      final admissionsList = (data['admissions'] as List? ?? [])
          .map((a) => PartnerAdmission.fromJson(a))
          .toList();

      return {
        'partner': partner,
        'admissions': admissionsList,
      };
    } catch (e) {
      // In case browser preflight or POST fails, attempt GET fallback
      final getUri = Uri.parse('$_baseUrl/api/partners/auth?code=${Uri.encodeComponent(cleanCode)}');
      final getRes = await http.get(getUri);
      final getData = jsonDecode(getRes.body) as Map<String, dynamic>;
      if (getRes.statusCode != 200 || getData['ok'] != true) {
        throw Exception(getData['error'] ?? 'Partner verification failed');
      }
      return {
        'partner': Partner.fromJson(getData['partner']),
        'admissions': (getData['admissions'] as List? ?? [])
            .map((a) => PartnerAdmission.fromJson(a))
            .toList(),
      };
    }
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
      headers: {'Content-Type': 'application/json'},
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
    final res = await http.get(uri);

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
      }),
    );

    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode != 200 || data['ok'] != true) {
      throw Exception(data['error'] ?? 'Partner registration failed');
    }

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
      headers: {'Content-Type': 'application/json'},
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
