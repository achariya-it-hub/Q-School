import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;

import '../data.dart';
import '../partner/api_service.dart';
import '../partner/models.dart';

class GoogleAuthException implements Exception {
  final String message;
  const GoogleAuthException(this.message);

  @override
  String toString() => message;
}

class GoogleSignInOutcome {
  final AuthUser user;
  final Partner? partner;
  final List<PartnerAdmission> admissions;
  final bool partnerNeedsRegistration;

  const GoogleSignInOutcome({
    required this.user,
    this.partner,
    this.admissions = const [],
    this.partnerNeedsRegistration = false,
  });
}

class GoogleAuthService {
  GoogleAuthService._internal();
  static final GoogleAuthService instance = GoogleAuthService._internal();

  static const String defaultWebClientId =
      '784665159823-4aloigc4h10psf282ni1oveboubbilin.apps.googleusercontent.com';
  static const String androidOAuthClientId =
      '784665159823-nk3j6o9mbts1i1q2g77i15hnnk4i8nan.apps.googleusercontent.com';

  static const String _webClientId = String.fromEnvironment(
    'GOOGLE_WEB_CLIENT_ID',
    defaultValue: defaultWebClientId,
  );
  static const String _serverClientId = String.fromEnvironment(
    'GOOGLE_SERVER_CLIENT_ID',
    defaultValue: defaultWebClientId,
  );

  late final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: const <String>['email', 'profile'],
    clientId: kIsWeb && _webClientId.isNotEmpty ? _webClientId : null,
    serverClientId: !kIsWeb && _serverClientId.isNotEmpty ? _serverClientId : null,
  );

  /// Opens the native Gmail / Google account chooser and syncs with Q-School ERP.
  /// Returns `null` if the user cancels the account picker.
  Future<GoogleSignInOutcome?> signInWithGmail({
    required String role,
    bool forceAccountPicker = true,
  }) async {
    try {
      if (forceAccountPicker) {
        try {
          await _googleSignIn.signOut();
        } catch (_) {
          // Ignore if no previous Google session exists
        }
      }

      final GoogleSignInAccount? account = await _googleSignIn.signIn();
      if (account == null) {
        // User dismissed the Google sign-in sheet
        return null;
      }

      final GoogleSignInAuthentication auth = await account.authentication;
      final String displayName = (account.displayName ?? '').trim().isNotEmpty
          ? account.displayName!.trim()
          : account.email.split('@').first;

      AuthUser resolvedUser = AuthUser(
        id: account.id,
        name: displayName,
        email: account.email.trim().toLowerCase(),
        photoUrl: account.photoUrl,
        provider: 'google',
      );

      Partner? matchedPartner;
      List<PartnerAdmission> admissions = const [];
      bool partnerNeedsRegistration = false;

      // Sync verified Google session with Q-School Cloud ERP
      try {
        final baseUrl = PartnerApiService().baseUrl;
        final uri = Uri.parse('$baseUrl/api/mobile/auth/google');
        final res = await http
            .post(
              uri,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({
                'idToken': auth.idToken,
                'accessToken': auth.accessToken,
                'role': role,
                'displayName': displayName,
                'photoUrl': account.photoUrl,
              }),
            )
            .timeout(const Duration(seconds: 10));

        final body = jsonDecode(res.body) as Map<String, dynamic>;

        if (res.statusCode == 403) {
          throw GoogleAuthException(
            body['error']?.toString() ?? 'Account is inactive. Please contact Q-School Admin.',
          );
        }

        if (res.statusCode == 200 && body['ok'] == true) {
          final serverUser = body['user'] as Map<String, dynamic>?;
          if (serverUser != null) {
            resolvedUser = AuthUser(
              id: serverUser['id']?.toString() ?? account.id,
              name: serverUser['name']?.toString() ?? displayName,
              email: serverUser['email']?.toString() ?? account.email.toLowerCase(),
              photoUrl: serverUser['photoUrl']?.toString() ?? account.photoUrl,
              provider: 'google',
            );
          }

          if (role == 'partner') {
            if (body['partnerFound'] == true && body['partner'] != null) {
              matchedPartner = Partner.fromJson(body['partner'] as Map<String, dynamic>);
              admissions = (body['admissions'] as List? ?? [])
                  .map((a) => PartnerAdmission.fromJson(a as Map<String, dynamic>))
                  .toList();
            } else {
              partnerNeedsRegistration = true;
            }
          }
        } else if (role == 'partner') {
          partnerNeedsRegistration = true;
        }
      } on GoogleAuthException {
        rethrow;
      } catch (e) {
        if (role == 'partner') {
          partnerNeedsRegistration = true;
        }
        debugPrint('[GoogleAuthService] ERP sync warning: $e');
      }

      currentUser.value = resolvedUser;

      return GoogleSignInOutcome(
        user: resolvedUser,
        partner: matchedPartner,
        admissions: admissions,
        partnerNeedsRegistration: partnerNeedsRegistration,
      );
    } on PlatformException catch (e) {
      final details = '${e.code} ${e.message ?? ''}'.toLowerCase();
      if (details.contains('canceled') || details.contains('cancelled')) {
        return null;
      }
      if (details.contains('10:') ||
          details.contains('sign_in_failed') ||
          details.contains('developer_error')) {
        throw const GoogleAuthException(
          'Google Sign-In needs Android OAuth SHA-1 / google-services.json configured for package com.qschool.qschool (see docs/09-flutter-google-signin.md).',
        );
      }
      if (kIsWeb && (details.contains('client_id') || details.contains('idpiframe'))) {
        throw const GoogleAuthException(
          'Set your Google Web Client ID in web/index.html or pass --dart-define=GOOGLE_WEB_CLIENT_ID=... (see docs/09-flutter-google-signin.md).',
        );
      }
      throw GoogleAuthException(e.message ?? 'Google Sign-In failed (${e.code}).');
    } catch (e) {
      if (e is GoogleAuthException) rethrow;
      throw GoogleAuthException(e.toString().replaceFirst('Exception: ', ''));
    }
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
    currentUser.value = null;
  }
}

