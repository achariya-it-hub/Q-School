import 'package:flutter/material.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';

/// Shown right after a code-only sign-in (or an admin password reset): the partner must pick a password
/// before entering the app. From then on they sign in with mobile/email + password.
class PartnerSetPasswordScreen extends StatefulWidget {
  const PartnerSetPasswordScreen({
    super.key,
    required this.partner,
    required this.next,
    this.hasCurrent = false,
    this.currentPassword,
  });

  final Partner partner;
  final Widget next;

  /// True when a password already exists (admin issued a temporary one) and must be sent as the current password.
  final bool hasCurrent;
  final String? currentPassword;

  @override
  State<PartnerSetPasswordScreen> createState() => _PartnerSetPasswordScreenState();
}

class _PartnerSetPasswordScreenState extends State<PartnerSetPasswordScreen> {
  final _pw1 = TextEditingController();
  final _pw2 = TextEditingController();
  bool _busy = false;
  bool _obscure = true;
  String _error = '';

  Future<void> _save() async {
    final a = _pw1.text;
    if (a.length < 8 || !RegExp(r'[A-Za-z]').hasMatch(a) || !RegExp(r'\d').hasMatch(a)) {
      setState(() => _error = 'Use at least 8 characters, with a letter and a number.');
      return;
    }
    if (a != _pw2.text) {
      setState(() => _error = 'The two passwords do not match.');
      return;
    }
    setState(() {
      _busy = true;
      _error = '';
    });
    try {
      await PartnerApiService().setPassword(
        newPassword: a,
        currentPassword: widget.hasCurrent ? widget.currentPassword : null,
      );
      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => widget.next), (_) => false);
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  InputDecoration _dec(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Color(0xFF94A6A1)),
        prefixIcon: const Icon(Icons.lock_outline, color: QS.teal, size: 22),
        suffixIcon: IconButton(
          icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: QS.sub, size: 20),
          onPressed: () => setState(() => _obscure = !_obscure),
        ),
        filled: true,
        fillColor: QS.field,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      );

  @override
  Widget build(BuildContext context) {
    final p = widget.partner;
    final login = (p.email.isNotEmpty ? p.email : p.phone);
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 30),
                const Center(child: Icon(Icons.lock_reset_rounded, color: QS.teal, size: 54)),
                const SizedBox(height: 18),
                const Center(
                  child: Text('Create your password', style: TextStyle(color: QS.ink, fontSize: 22, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 8),
                Text(
                  'Hi ${p.name}! To keep your commission and payout details safe, sign-in now uses a password. '
                  'Next time, sign in with $login and this password.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: QS.sub, fontSize: 13, height: 1.4),
                ),
                const SizedBox(height: 28),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), border: Border.all(color: QS.line)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('NEW PASSWORD', style: TextStyle(color: QS.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                      const SizedBox(height: 10),
                      TextField(controller: _pw1, obscureText: _obscure, style: const TextStyle(color: QS.ink), decoration: _dec('At least 8 characters')),
                      const SizedBox(height: 14),
                      const Text('CONFIRM PASSWORD', style: TextStyle(color: QS.teal, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _pw2,
                        obscureText: _obscure,
                        onSubmitted: (_) => _save(),
                        style: const TextStyle(color: QS.ink),
                        decoration: _dec('Type it again'),
                      ),
                      if (_error.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Text(_error, style: const TextStyle(color: Colors.redAccent, fontSize: 12.5)),
                      ],
                      const SizedBox(height: 20),
                      SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: QS.teal,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 0,
                          ),
                          onPressed: _busy ? null : _save,
                          child: _busy
                              ? const SizedBox(height: 22, width: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : const Text('Save & continue', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ),
                    ],
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
