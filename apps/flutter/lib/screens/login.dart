import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';
import '../partner/api_service.dart';
import '../partner/models.dart';
import '../partner/partner_shell.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  int _selectedRole = 0; // 0: Student, 1: Teacher, 2: Admin, 3: Partner
  bool _securePassword = true;
  bool _isLoading = false;
  final TextEditingController _emailController =
      TextEditingController(text: 'alex@gmail.com');
  final TextEditingController _passwordController =
      TextEditingController(text: '••••••••••••');

  void _selectRole(int index) {
    setState(() {
      _selectedRole = index;
      if (index == 0) {
        _emailController.text = 'alex@gmail.com';
      } else if (index == 1) {
        _emailController.text = 'alex.prof@qschool.edu';
      } else if (index == 2) {
        _emailController.text = 'admin@qschool.edu';
      } else if (index == 3) {
        _emailController.text = 'MKT-BALA';
      }
    });
  }

  Future<void> _onLogin() async {
    if (_selectedRole == 0) {
      userRole.value = UserRole.student;
      Navigator.of(context).pushNamed('/interests');
    } else if (_selectedRole == 1) {
      userRole.value = UserRole.teacher;
      Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
    } else if (_selectedRole == 2) {
      userRole.value = UserRole.admin;
      Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
    } else {
      // Partner Role
      final code = _emailController.text.trim().toUpperCase();
      if (code.isEmpty) {
        Navigator.of(context).pushNamed('/partner');
        return;
      }
      setState(() => _isLoading = true);
      try {
        final res = await PartnerApiService().loginWithCode(code);
        final partner = res['partner'] as Partner;
        final admissions = res['admissions'] as List<PartnerAdmission>;
        if (!mounted) return;
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => PartnerShell(
              partner: partner,
              initialAdmissions: admissions,
            ),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.redAccent,
          ),
        );
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          children: [
            const SizedBox(height: 10),

            // Logo Header
            const Center(
              child: QSchoolLogo(size: 40, taglineText: 'Learn · Grow · Achieve'),
            ),
            const SizedBox(height: 32),

            // Glass Container
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: QS.line, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.deep, 0.06),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Center(
                    child: Text(
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: QS.ink,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Center(
                    child: Text(
                      'Login to continue your learning journey',
                      style: TextStyle(fontSize: 13.5, color: QS.sub),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Role Selector Segment
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEF5F3),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        _roleChip(0, 'Student'),
                        _roleChip(1, 'Teacher'),
                        _roleChip(2, 'Admin'),
                        _roleChip(3, 'Partner'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Email or Partner Code Input
                  Text(
                    _selectedRole == 3
                        ? 'Partner Referral Code or Mobile'
                        : 'Email or Mobile Number',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: QS.field,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: QS.line),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _selectedRole == 3
                              ? Icons.handshake_rounded
                              : Icons.person_outline_rounded,
                          size: 20,
                          color: QS.teal,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _emailController,
                            style: const TextStyle(
                                fontSize: 14,
                                color: QS.ink,
                                fontWeight: FontWeight.w500),
                            decoration: InputDecoration(
                              hintText: _selectedRole == 3
                                  ? 'e.g. MKT-BALA or mobile'
                                  : 'Enter email or mobile',
                              hintStyle: const TextStyle(color: Color(0xFF94A6A1)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_selectedRole == 3) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        const Text(
                          'Quick Codes: ',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: QS.sub,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        _demoCodeChip('MKT-BALA'),
                        _demoCodeChip('ACH-PUDU'),
                        _demoCodeChip('EDT-KAVI'),
                      ],
                    ),
                  ],
                  const SizedBox(height: 18),

                  // Password Input
                  Text(
                    _selectedRole == 3 ? 'Password (Optional for Partner)' : 'Password',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 52,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: QS.field,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: QS.line),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.lock_outline_rounded,
                            size: 20, color: QS.teal),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _passwordController,
                            obscureText: _securePassword,
                            style: const TextStyle(
                                fontSize: 14,
                                color: QS.ink,
                                fontWeight: FontWeight.w500),
                            decoration: const InputDecoration(
                              hintText: 'Enter password',
                              hintStyle: TextStyle(color: Color(0xFF94A6A1)),
                            ),
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(
                              () => _securePassword = !_securePassword),
                          child: Icon(
                            _securePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            size: 20,
                            color: QS.sub,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Forgot Password
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {},
                      style: TextButton.styleFrom(
                        foregroundColor: QS.teal,
                      ),
                      child: const Text(
                        'Forgot Password?',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Login Button
                  if (_isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: CircularProgressIndicator(color: QS.teal),
                      ),
                    )
                  else
                    QSButton(
                      label: _selectedRole == 3 ? 'Login as Partner' : 'Login',
                      onTap: _onLogin,
                    ),
                  const SizedBox(height: 24),

                  // Social Divider
                  Row(
                    children: const [
                      Expanded(child: Divider(color: QS.line)),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'or continue with',
                          style: TextStyle(color: QS.sub, fontSize: 12.5),
                        ),
                      ),
                      Expanded(child: Divider(color: QS.line)),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Social Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _socialButton(
                        icon: Icons.g_mobiledata_rounded,
                        label: 'Google',
                        iconColor: const Color(0xFFEA4335),
                        onTap: _onLogin,
                      ),
                      const SizedBox(width: 16),
                      _socialButton(
                        icon: Icons.apple,
                        label: 'Apple',
                        iconColor: Colors.black,
                        onTap: _onLogin,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Sign Up Footer Link
            Center(
              child: GestureDetector(
                onTap: () => Navigator.of(context).pushNamed('/signup'),
                child: RichText(
                  text: const TextSpan(
                    text: "Don't have an account? ",
                    style: TextStyle(color: QS.sub, fontSize: 14),
                    children: [
                      TextSpan(
                        text: 'Sign Up',
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

  Widget _roleChip(int index, String label) {
    final active = _selectedRole == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => _selectRole(index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            gradient: active ? QS.primaryGradient : null,
            borderRadius: BorderRadius.circular(12),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: fade(QS.deep, 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: active ? FontWeight.w800 : FontWeight.w600,
              color: active ? Colors.white : QS.sub,
            ),
          ),
        ),
      ),
    );
  }

  Widget _demoCodeChip(String code) {
    return InkWell(
      onTap: () => setState(() => _emailController.text = code),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: fade(QS.teal, 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: fade(QS.teal, 0.3)),
        ),
        child: Text(
          code,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: QS.teal,
          ),
        ),
      ),
    );
  }

  Widget _socialButton({
    required IconData icon,
    required String label,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 118,
        height: 46,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: QS.line, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: fade(QS.deep, 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: iconColor),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: QS.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
