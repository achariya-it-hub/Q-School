import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  int _selectedRole = 0; // 0: Student, 1: Teacher
  bool _agreed = true;
  bool _securePassword = true;

  final _nameController = TextEditingController(text: 'Alex Johnson');
  final _emailController = TextEditingController(text: 'alex@gmail.com');
  final _mobileController = TextEditingController(text: '98765 43210');
  final _passwordController = TextEditingController(text: '••••••••••••');

  void _onSignUp() {
    Navigator.of(context).pushNamed('/interests');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: QS.ink),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          children: [
            // Q-School Logo Header
            const Center(
              child: QSchoolLogo(size: 36, showTagline: false),
            ),
            const SizedBox(height: 20),

            // Title & Subtitle
            const Text(
              'Create Account',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Join thousands of learners at Q-School',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.5,
                color: QS.sub,
              ),
            ),
            const SizedBox(height: 24),

            // Role Selector Segment (Student | Teacher)
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F5F3),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  _roleChip(0, 'Student'),
                  _roleChip(1, 'Teacher'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Full Name
            _label('Full Name'),
            _inputField(
              controller: _nameController,
              hint: 'Enter your full name',
              icon: Icons.person_outline_rounded,
            ),
            const SizedBox(height: 14),

            // Email Address
            _label('Email Address'),
            _inputField(
              controller: _emailController,
              hint: 'Enter your email address',
              icon: Icons.mail_outline_rounded,
            ),
            const SizedBox(height: 14),

            // Mobile Number
            _label('Mobile Number'),
            Container(
              height: 52,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: QS.field,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: QS.line),
              ),
              child: Row(
                children: [
                  const Text('🇮🇳', style: TextStyle(fontSize: 18)),
                  const SizedBox(width: 6),
                  const Text(
                    '+91',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const VerticalDivider(width: 1, indent: 12, endIndent: 12),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _mobileController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(fontSize: 14, color: QS.ink),
                      decoration: const InputDecoration(
                        hintText: 'Enter mobile number',
                        hintStyle: TextStyle(color: Color(0xFF94A6A1)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Password
            _label('Password'),
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
                      size: 20, color: QS.sub),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _passwordController,
                      obscureText: _securePassword,
                      style: const TextStyle(fontSize: 14, color: QS.ink),
                      decoration: const InputDecoration(
                        hintText: 'Create a password',
                        hintStyle: TextStyle(color: Color(0xFF94A6A1)),
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () =>
                        setState(() => _securePassword = !_securePassword),
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
            const SizedBox(height: 16),

            // Terms Checkbox
            Row(
              children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: Checkbox(
                    value: _agreed,
                    activeColor: QS.deep,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(5),
                    ),
                    onChanged: (val) => setState(() => _agreed = val ?? true),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: RichText(
                    text: const TextSpan(
                      text: 'I agree to ',
                      style: TextStyle(color: QS.sub, fontSize: 12.5),
                      children: [
                        TextSpan(
                          text: 'Terms & Privacy Policy',
                          style: TextStyle(
                            color: QS.teal,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Sign Up Button
            QSButton(
              label: 'Sign Up',
              onTap: _onSignUp,
            ),
            const SizedBox(height: 24),

            // Social Login Divider
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

            // Social Buttons (Google & Apple)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _socialButton(
                  icon: Icons.g_mobiledata_rounded,
                  label: 'Google',
                  iconColor: const Color(0xFFEA4335),
                  onTap: _onSignUp,
                ),
                const SizedBox(width: 16),
                _socialButton(
                  icon: Icons.apple,
                  label: 'Apple',
                  iconColor: Colors.black,
                  onTap: _onSignUp,
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Footer Link
            Center(
              child: GestureDetector(
                onTap: () => Navigator.of(context).pushNamed('/login'),
                child: RichText(
                  text: const TextSpan(
                    text: 'Already have an account? ',
                    style: TextStyle(color: QS.sub, fontSize: 13.5),
                    children: [
                      TextSpan(
                        text: 'Login',
                        style: TextStyle(
                          color: QS.teal,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: QS.ink,
        ),
      ),
    );
  }

  Widget _inputField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
  }) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: QS.field,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: QS.line),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: QS.sub),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 14, color: QS.ink),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(color: Color(0xFF94A6A1)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _roleChip(int index, String label) {
    final active = _selectedRole == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedRole = index),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 38,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? QS.deep : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: active ? FontWeight.w700 : FontWeight.w500,
              color: active ? Colors.white : QS.sub,
            ),
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
        width: 120,
        height: 48,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: QS.line, width: 1.5),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 24, color: iconColor),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w600,
                color: QS.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
