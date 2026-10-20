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
    if (kIsWeb) return 'http://localhost:3100';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3100'; // Standard Android emulator loopback
    }
    return 'http://localhost:3100';
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
}
