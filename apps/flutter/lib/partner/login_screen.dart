import 'package:flutter/material.dart';
import '../screens/login.dart';
import '../services/google_auth_service.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/google_logo.dart';
import 'api_service.dart';
import 'models.dart';
import 'partner_shell.dart';
import 'set_password_screen.dart';

class PartnerLoginScreen extends StatefulWidget {
  const PartnerLoginScreen({super.key});

  @override
  State<PartnerLoginScreen> createState() => _PartnerLoginScreenState();
}

class _PartnerLoginScreenState extends State<PartnerLoginScreen> {
  final _codeController = TextEditingController();
  final _idController = TextEditingController();
  final _pwController = TextEditingController();
  bool _codeMode = false; // legacy one-time referral-code sign-in
  bool _obscure = true;
  bool _loading = false;
  bool _googleLoading = false;
  String _errorMessage = '';

  Future<void> _loginWithGmail() async {
    if (_googleLoading || _loading) return;
    setState(() {
      _googleLoading = true;
      _errorMessage = '';
    });

    try {
      final outcome = await GoogleAuthService.instance.signInWithGmail(role: 'partner');
      if (!mounted || outcome == null) return;

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
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gmail verified (${outcome.user.email}). Complete partner registration below.'),
            backgroundColor: QS.teal,
          ),
        );
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => PartnerSignupSheet(
            initialName: outcome.user.name,
            initialEmail: outcome.user.email,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  /// Goes to the app; existing code-only partners (or after an admin reset) must set a password first.
  void _enter(Map<String, dynamic> res) {
    final partner = res['partner'] as Partner;
    final admissions = res['admissions'] as List<PartnerAdmission>;
    final shell = PartnerShell(partner: partner, initialAdmissions: admissions);
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (_) => res['needsPassword'] == true
            ? PartnerSetPasswordScreen(partner: partner, next: shell, hasCurrent: _codeMode ? false : true, currentPassword: _codeMode ? null : _pwController.text)
            : shell,
      ),
      (_) => false,
    );
  }

  Future<void> _signIn() async {
    final id = _idController.text.trim();
    final pw = _pwController.text;
    final code = _codeController.text.trim();
    if (_codeMode ? code.isEmpty : (id.isEmpty || pw.isEmpty)) {
      setState(() => _errorMessage = _codeMode ? 'Please enter your partner referral code.' : 'Enter your mobile number (or email) and password.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = '';
    });

    try {
      final res = _codeMode
          ? await PartnerApiService().loginWithCode(code)
          : await PartnerApiService().loginWithPassword(id, pw);
      if (!mounted) return;
      _enter(res);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  InputDecoration _dec(String hint, IconData icon) => InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Color(0xFF94A6A1), fontWeight: FontWeight.normal, letterSpacing: 0),
        prefixIcon: Icon(icon, color: QS.teal, size: 22),
        filled: true,
        fillColor: QS.field,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      );

  void _showServerSettings() {
    final urlController = TextEditingController(text: PartnerApiService().baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('API Server Endpoint', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set host URL (e.g. http://10.0.2.2:3100 for Android emulator or your PC LAN IP: http://192.168.x.x:3100)',
              style: TextStyle(fontSize: 12, color: QS.sub),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlController,
              decoration: InputDecoration(
                filled: true,
                fillColor: QS.field,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: QS.teal),
            onPressed: () {
              PartnerApiService().setBaseUrl(urlController.text);
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('API URL set to: ${PartnerApiService().baseUrl}')),
              );
            },
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.settings, color: QS.sub, size: 20),
                  onPressed: _showServerSettings,
                  tooltip: 'Server Settings',
                ),
              ),
              const SizedBox(height: 20),
              // Brand logo
              const Center(child: QSchoolLogo(size: 96)),
              const SizedBox(height: 24),

              // Title
              const Center(
                child: Text(
                  'Partner & Referrals',
                  style: TextStyle(
                    color: QS.ink,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              const Center(
                child: Text(
                  'Make on-field student admissions, link to ERP, and track your commission earnings.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: QS.sub, fontSize: 13, height: 1.4),
                ),
              ),
              const SizedBox(height: 36),

              // Login Card
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: QS.line),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_codeMode) ...[
                      const Text(
                        'YOUR REFERRAL CODE',
                        style: TextStyle(color: QS.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _codeController,
                        textCapitalization: TextCapitalization.characters,
                        style: const TextStyle(color: QS.ink, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                        decoration: _dec('e.g. MKT-BALA', Icons.qr_code),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'For partners who used a code before. You will be asked to create a password right after.',
                        style: TextStyle(color: QS.sub, fontSize: 11.5, height: 1.4),
                      ),
                    ] else ...[
                      const Text(
                        'MOBILE NUMBER OR EMAIL',
                        style: TextStyle(color: QS.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _idController,
                        keyboardType: TextInputType.emailAddress,
                        autofillHints: const [AutofillHints.username],
                        style: const TextStyle(color: QS.ink, fontSize: 16, fontWeight: FontWeight.w600),
                        decoration: _dec('98765 43210 or you@email.com', Icons.person_outline),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'PASSWORD',
                        style: TextStyle(color: QS.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _pwController,
                        obscureText: _obscure,
                        autofillHints: const [AutofillHints.password],
                        onSubmitted: (_) => _signIn(),
                        style: const TextStyle(color: QS.ink, fontSize: 16, fontWeight: FontWeight.w600),
                        decoration: _dec('Your password', Icons.lock_outline).copyWith(
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: QS.sub, size: 20),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                      ),
                    ],
                    if (_errorMessage.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: Colors.redAccent, size: 16),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage,
                                style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),

                    // Sign-in Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: QS.teal,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        onPressed: _loading ? null : _signIn,
                        child: _loading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Access Marketer Portal',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_forward, size: 18, color: Colors.white),
                              ],
                            ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(child: Divider(color: QS.line)),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Text(
                            'OR',
                            style: TextStyle(
                              color: QS.sub,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        Expanded(child: Divider(color: QS.line)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    GmailSignInButton(
                      loading: _googleLoading,
                      label: 'Sign in with Gmail',
                      darkSurface: false,
                      onTap: _loginWithGmail,
                    ),
                    const SizedBox(height: 10),
                    Center(
                      child: TextButton(
                        onPressed: () => showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => const PartnerSignupSheet(),
                        ),
                        child: const Text('New here? Create a partner account', style: TextStyle(color: QS.teal, fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
                    ),
                    Center(
                      child: TextButton(
                        onPressed: () => setState(() {
                          _codeMode = !_codeMode;
                          _errorMessage = '';
                        }),
                        child: Text(
                          _codeMode ? 'Back to mobile / email sign-in' : 'Used a referral code before? Sign in once with your code',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: QS.sub, fontSize: 12),
                        ),
                      ),
                    ),
                    if (!_codeMode)
                      const Center(
                        child: Text('Forgot your password? Ask Q-School admin to reset it.', style: TextStyle(color: Color(0xFF94A6A1), fontSize: 11)),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 36),
              Center(
                child: Text(
                  'Connected to Q-School Cloud ERP • erp.theqschool.com',
                  style: TextStyle(color: Color(0xFF94A6A1), fontSize: 11),
                ),
              ),
            ],
          ),
        ),
      ),
    ),
    );
  }
}
