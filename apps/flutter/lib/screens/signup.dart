import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';
import 'login.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  void _openPartnerSignup(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const PartnerSignupSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF7FAF9),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: QS.ink),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          children: [
            const Center(
              child: QSchoolLogo(size: 38, showTagline: false),
            ),
            const SizedBox(height: 24),
            const Text(
              'Account Registration',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'In the Q-School mobile app, only Partners can self-register. Student and Teacher accounts are approved by Q-School Admins.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                color: QS.sub,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 28),

            // Partner Self-Registration Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: QS.teal, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.deep, 0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE3F4F0),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.handshake_rounded,
                          color: QS.teal,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Partner Self-Registration',
                              style: TextStyle(
                                fontSize: 16.5,
                                fontWeight: FontWeight.w800,
                                color: QS.ink,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Instant referral code • 10% commission',
                              style: TextStyle(
                                fontSize: 12,
                                color: QS.teal,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    'Register yourself as a Q-School Referral Partner to refer student admissions and track your payouts directly from the Partner Portal.',
                    style: TextStyle(
                      fontSize: 13,
                      color: QS.sub,
                      height: 1.45,
                    ),
                  ),
                  const SizedBox(height: 16),
                  QSButton(
                    label: 'Sign Up as Partner',
                    onTap: () => _openPartnerSignup(context),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Student & Teacher Admin Approval Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBF2),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: const Color(0xFFF6E6C2), width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF0D4),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.admin_panel_settings_rounded,
                          color: Color(0xFF8A5A00),
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Students & Teachers',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: QS.ink,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Admin Approval Required',
                              style: TextStyle(
                                fontSize: 12,
                                color: Color(0xFF8A5A00),
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    '• Students are enrolled and approved by Q-School Admins upon admission.\n'
                    '• Teachers & Faculty are onboarded and approved by Q-School Admins in the ERP Console.\n'
                    '• Once approved by an Admin, you can log in using your registered email or mobile number.',
                    style: TextStyle(
                      fontSize: 12.8,
                      color: Color(0xFF5C4512),
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            Center(
              child: GestureDetector(
                onTap: () => Navigator.of(context).pushReplacementNamed('/login'),
                child: RichText(
                  text: const TextSpan(
                    text: 'Already approved or registered? ',
                    style: TextStyle(color: QS.sub, fontSize: 13.5),
                    children: [
                      TextSpan(
                        text: 'Back to Login',
                        style: TextStyle(
                          color: QS.teal,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
