import 'package:flutter/material.dart';
import '../data.dart';
import '../services/google_auth_service.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/google_logo.dart';
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
  bool _isGoogleLoading = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String get _roleKey {
    switch (_selectedRole) {
      case 1:
        return 'teacher';
      case 2:
        return 'admin';
      case 3:
        return 'partner';
      default:
        return 'student';
    }
  }

  Future<void> _onGoogleSignIn() async {
    if (_isGoogleLoading || _isLoading) return;
    setState(() => _isGoogleLoading = true);

    try {
      final outcome = await GoogleAuthService.instance.signInWithGmail(
        role: _roleKey,
      );
      if (!mounted || outcome == null) return;

      if (_selectedRole == 3) {
        if (outcome.partner != null) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (_) => PartnerShell(
                partner: outcome.partner!,
                initialAdmissions: outcome.admissions,
              ),
            ),
            (_) => false,
          );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Signed in with Gmail as Partner (${outcome.partner!.code})'),
              backgroundColor: QS.deep,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gmail verified (${outcome.user.email}). Complete partner setup below.'),
              backgroundColor: QS.teal,
            ),
          );
          _openPartnerSignupSheet(
            context,
            initialName: outcome.user.name,
            initialEmail: outcome.user.email,
          );
        }
        return;
      }

      if (_selectedRole == 0) {
        userRole.value = UserRole.student;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Signed in with Gmail: ${outcome.user.email}'),
            backgroundColor: QS.deep,
          ),
        );
        Navigator.of(context).pushNamed('/interests');
      } else if (_selectedRole == 1) {
        userRole.value = UserRole.teacher;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Signed in as Educator: ${outcome.user.email}'),
            backgroundColor: QS.deep,
          ),
        );
        Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
      } else {
        userRole.value = UserRole.admin;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Signed in as Admin: ${outcome.user.email}'),
            backgroundColor: QS.deep,
          ),
        );
        Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.redAccent,
          duration: const Duration(seconds: 4),
        ),
      );
    } finally {
      if (mounted) setState(() => _isGoogleLoading = false);
    }
  }

  void _selectRole(int index) {
    setState(() {
      _selectedRole = index;
      _emailController.clear();
      _passwordController.clear();
    });
  }

  Future<void> _onLogin() async {
    if (_selectedRole != 3) {
      final identifier = _emailController.text.trim();
      final password = _passwordController.text.trim();

      if (identifier.isEmpty || password.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please enter your registered email/mobile and password.'),
            backgroundColor: Colors.redAccent,
          ),
        );
        return;
      }

      setState(() => _isLoading = true);
      try {
        final verifiedUser = await PartnerApiService().loginMobileUser(
          identifier: identifier,
          password: password,
          role: _roleKey,
        );

        if (!mounted) return;
        currentUser.value = AuthUser(
          id: verifiedUser['id']?.toString() ?? identifier,
          name: verifiedUser['name']?.toString() ?? 'Q-School User',
          email: verifiedUser['email']?.toString() ?? identifier,
          provider: 'password',
        );

        if (_selectedRole == 0) {
          userRole.value = UserRole.student;
          Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
        } else if (_selectedRole == 1) {
          userRole.value = UserRole.teacher;
          Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
        } else {
          userRole.value = UserRole.admin;
          Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
        }
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
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
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => PartnerShell(
              partner: partner,
              initialAdmissions: admissions,
            ),
          ),
          (_) => false,
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
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: _selectedRole == 3
                          ? const Color(0xFFEAF7F4)
                          : const Color(0xFFFFF8EA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _selectedRole == 3
                            ? const Color(0xFFBFE6DC)
                            : const Color(0xFFF6E6C2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _selectedRole == 3
                              ? Icons.verified_user_outlined
                              : Icons.admin_panel_settings_outlined,
                          size: 18,
                          color: _selectedRole == 3 ? QS.teal : const Color(0xFF8A5A00),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _selectedRole == 3
                                ? 'Partners can self-register below to receive an instant referral code.'
                                : 'Student & Teacher accounts require Q-School Admin approval. Only Partners can self-sign-up.',
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: _selectedRole == 3 ? QS.deep : const Color(0xFF6B4A00),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

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
                            key: ValueKey<bool>(_securePassword),
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
                        IconButton(
                          tooltip: _securePassword ? 'Show password' : 'Hide password',
                          splashRadius: 20,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: Icon(
                            _securePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                            size: 20,
                            color: _securePassword ? QS.sub : QS.teal,
                          ),
                          onPressed: () {
                            setState(() {
                              _securePassword = !_securePassword;
                            });
                          },
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
                  else ...[
                    QSButton(
                      label: _selectedRole == 3 ? 'Login with Referral Code' : 'Login',
                      onTap: _onLogin,
                    ),
                    if (_selectedRole == 3) ...[
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: () => _openPartnerSignupSheet(context),
                        icon: const Icon(Icons.person_add_alt_1_rounded, size: 18, color: QS.teal),
                        label: const Text(
                          'New Partner? Sign Up & Earn 10%',
                          style: TextStyle(
                            color: QS.teal,
                            fontWeight: FontWeight.w700,
                            fontSize: 13,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size.fromHeight(48),
                          side: const BorderSide(color: QS.teal, width: 1.2),
                          backgroundColor: const Color(0xFFF0FAF7),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                      ),
                    ],
                  ],
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

                  // Social Buttons — Primary Sign in with Gmail + Apple
                  GmailSignInButton(
                    loading: _isGoogleLoading,
                    label: _selectedRole == 3
                        ? 'Sign in with Gmail (Partner)'
                        : 'Sign in with Gmail',
                    onTap: _onGoogleSignIn,
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: _socialButton(
                      icon: Icons.apple,
                      label: 'Continue with Apple',
                      iconColor: Colors.black,
                      onTap: _onLogin,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Sign Up Footer Link (Self-registration is exclusively for Partners)
            Center(
              child: GestureDetector(
                onTap: () {
                  if (_selectedRole != 3) {
                    _selectRole(3);
                  }
                  _openPartnerSignupSheet(context);
                },
                child: RichText(
                  textAlign: TextAlign.center,
                  text: const TextSpan(
                    text: 'Only Partners can self-register · ',
                    style: TextStyle(color: QS.sub, fontSize: 13.5),
                    children: [
                      TextSpan(
                        text: 'Sign Up as Partner',
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

  Widget _socialButton({
    required IconData icon,
    required String label,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
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
            Icon(icon, size: 22, color: iconColor),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: QS.ink,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openPartnerSignupSheet(
    BuildContext context, {
    String? initialName,
    String? initialEmail,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PartnerSignupSheet(
        initialName: initialName,
        initialEmail: initialEmail,
      ),
    );
  }
}

class PartnerSignupSheet extends StatefulWidget {
  const PartnerSignupSheet({
    super.key,
    this.initialName,
    this.initialEmail,
  });

  final String? initialName;
  final String? initialEmail;

  @override
  State<PartnerSignupSheet> createState() => _PartnerSignupSheetState();
}

class _PartnerSignupSheetState extends State<PartnerSignupSheet> {
  late final TextEditingController _nameCtrl =
      TextEditingController(text: widget.initialName ?? '');
  final _phoneCtrl = TextEditingController();
  late final TextEditingController _emailCtrl =
      TextEditingController(text: widget.initialEmail ?? '');
  final _orgCtrl = TextEditingController();
  final _upiCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();

  String _category = 'Education Consultant';
  String _centreId = 'all';
  bool _submitting = false;
  String? _error;

  final _categories = const [
    'Education Consultant',
    'School Partner',
    'Trainer / HOC',
    'Parent Ambassador',
    'Marketing Team',
    'Campus Ambassador',
    'Affiliate',
    'Agent',
  ];

  final _centres = const [
    {'id': 'all', 'name': 'All Centres (Global)'},
    {'id': 'mk', 'name': 'MK Centre'},
    {'id': 'pudu', 'name': 'Pudu Centre'},
    {'id': 'trichy', 'name': 'Trichy Centre'},
    {'id': 'coimbatore', 'name': 'Coimbatore Centre'},
    {'id': 'chennai', 'name': 'Chennai Centre'},
  ];

  Future<void> _submitSignup() async {
    final name = _nameCtrl.text.trim();
    final phone = _phoneCtrl.text.trim();
    final email = _emailCtrl.text.trim();

    if (name.isEmpty) {
      setState(() => _error = 'Please enter your full name');
      return;
    }
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) {
      setState(() => _error = 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.contains('@')) {
      setState(() => _error = 'Please enter a valid email address');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final res = await PartnerApiService().signupPartner(
        name: name,
        phone: phone,
        email: email,
        organization: _orgCtrl.text.trim(),
        category: _category,
        centreId: _centreId,
        upiId: _upiCtrl.text.trim(),
        requestedCode: _codeCtrl.text.trim().toUpperCase(),
      );

      final partner = res['partner'] as Partner;
      final admissions = res['admissions'] as List<PartnerAdmission>;

      if (!mounted) return;
      Navigator.of(context).pop(); // close modal sheet

      // Navigate to partner shell and clear stack so partner cannot switch to student/admin
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (_) => PartnerShell(
            partner: partner,
            initialAdmissions: admissions,
          ),
        ),
        (_) => false,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Welcome ${partner.name}! Referral Code: ${partner.code}'),
          backgroundColor: QS.deep,
          duration: const Duration(seconds: 4),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(20, 12, 20, 20 + bottomInset),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag Handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFFD5E3DF),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 14),

          // Header Row
          Row(
            children: [
              Container(
                height: 42,
                width: 42,
                decoration: BoxDecoration(
                  color: const Color(0xFFE3F4F0),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.handshake_rounded, color: QS.teal, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Partner Registration',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: QS.ink,
                      ),
                    ),
                    Text(
                      'Earn 10% commission on student admissions',
                      style: TextStyle(fontSize: 12, color: QS.sub),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, color: QS.sub),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Perks Pill Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _perkBadge('10% Commission'),
                const SizedBox(width: 6),
                _perkBadge('Referral Code & QR'),
                const SizedBox(width: 6),
                _perkBadge('UPI Direct Payouts'),
                const SizedBox(width: 6),
                _perkBadge('Mobile ERP Tracking'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (_error != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFFCEDED),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF3C2C2)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline_rounded, color: Color(0xFFB42E2E), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFFB42E2E),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          // Scrollable Inputs
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _fieldLabel('Full Name *'),
                  _textInput(_nameCtrl, 'e.g. Balasubramanian', Icons.person_outline_rounded),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('Mobile Number *'),
                            _textInput(_phoneCtrl, '10-digit mobile', Icons.phone_outlined,
                                keyboard: TextInputType.phone),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('Email Address *'),
                            _textInput(_emailCtrl, 'partner@mail.com', Icons.email_outlined,
                                keyboard: TextInputType.emailAddress),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('Partner Category'),
                            _dropdown<String>(
                              value: _category,
                              items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12.5)))).toList(),
                              onChanged: (v) => setState(() => _category = v ?? _category),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('Centre'),
                            _dropdown<String>(
                              value: _centreId,
                              items: _centres.map((c) => DropdownMenuItem(value: c['id']!, child: Text(c['name']!, style: const TextStyle(fontSize: 12.5)))).toList(),
                              onChanged: (v) => setState(() => _centreId = v ?? _centreId),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('School / Org (Optional)'),
                            _textInput(_orgCtrl, 'e.g. Cambridge Academy', Icons.business_outlined),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _fieldLabel('UPI ID for Payouts'),
                            _textInput(_upiCtrl, 'name@okhdfcbank', Icons.payment_outlined),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  _fieldLabel('Preferred Referral Code (Optional)'),
                  _textInput(_codeCtrl, 'e.g. MKT-BALA (auto-generated if empty)', Icons.tag_rounded),
                  const SizedBox(height: 18),

                  // Submit Button
                  if (_submitting)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: CircularProgressIndicator(color: QS.teal),
                      ),
                    )
                  else
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: QS.deep,
                          foregroundColor: Colors.white,
                          elevation: 2,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        onPressed: _submitSignup,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline_rounded, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Register as Partner & Get Started',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _perkBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FAF7),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFDCEDE8)),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: QS.teal,
        ),
      ),
    );
  }

  static Widget _fieldLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: QS.ink,
        ),
      ),
    );
  }

  static Widget _textInput(
    TextEditingController controller,
    String hint,
    IconData icon, {
    TextInputType keyboard = TextInputType.text,
  }) {
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: QS.field,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: QS.line),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: QS.teal),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: controller,
              keyboardType: keyboard,
              style: const TextStyle(fontSize: 13, color: QS.ink),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(color: Color(0xFF94A6A1), fontSize: 12.5),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _dropdown<T>({
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      height: 46,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: QS.field,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: QS.line),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          items: items,
          onChanged: onChanged,
          isExpanded: true,
          icon: const Icon(Icons.arrow_drop_down, color: QS.teal),
        ),
      ),
    );
  }
}
