import 'package:flutter/material.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';
import 'partner_shell.dart';

class PartnerLoginScreen extends StatefulWidget {
  const PartnerLoginScreen({super.key});

  @override
  State<PartnerLoginScreen> createState() => _PartnerLoginScreenState();
}

class _PartnerLoginScreenState extends State<PartnerLoginScreen> {
  final _codeController = TextEditingController();
  bool _loading = false;
  String _errorMessage = '';

  Future<void> _login(String code) async {
    final cleanCode = code.trim().toUpperCase();
    if (cleanCode.isEmpty) {
      setState(() => _errorMessage = 'Please enter your partner referral code.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = '';
    });

    try {
      final res = await PartnerApiService().loginWithCode(cleanCode);
      final partner = res['partner'] as Partner;
      final admissions = res['admissions'] as List<PartnerAdmission>;

      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => PartnerShell(
            partner: partner,
            initialAdmissions: admissions,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

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
    return Scaffold(
      backgroundColor: QS.deeper,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.topRight,
                child: IconButton(
                  icon: const Icon(Icons.settings, color: Colors.white54, size: 20),
                  onPressed: _showServerSettings,
                  tooltip: 'Server Settings',
                ),
              ),
              const SizedBox(height: 20),
              // Brand Icon
              Center(
                child: Container(
                  height: 72,
                  width: 72,
                  decoration: BoxDecoration(
                    gradient: QS.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: QS.mint.withOpacity(0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'Q',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Title
              const Center(
                child: Text(
                  'Partner & Referrals',
                  style: TextStyle(
                    color: Colors.white,
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
                  style: TextStyle(color: Colors.white60, fontSize: 13, height: 1.4),
                ),
              ),
              const SizedBox(height: 36),

              // Login Card
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: QS.darkSurface,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'YOUR REFERRAL CODE',
                      style: TextStyle(
                        color: QS.mint,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _codeController,
                      textCapitalization: TextCapitalization.characters,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                      decoration: InputDecoration(
                        hintText: 'e.g. MKT-BALA',
                        hintStyle: TextStyle(
                          color: Colors.white.withOpacity(0.3),
                          fontWeight: FontWeight.normal,
                          letterSpacing: 0,
                        ),
                        prefixIcon: const Icon(Icons.qr_code, color: QS.mint, size: 22),
                        filled: true,
                        fillColor: Colors.black.withOpacity(0.25),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
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
                        onPressed: _loading ? null : () => _login(_codeController.text),
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
                  ],
                ),
              ),

              const SizedBox(height: 32),
              // Demo Marketer Quick Buttons
              Center(
                child: Text(
                  'QUICK DEMO PROMOTERS',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _DemoButton(
                      code: 'MKT-BALA',
                      name: 'Bala Murugan',
                      onTap: () {
                        _codeController.text = 'MKT-BALA';
                        _login('MKT-BALA');
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _DemoButton(
                      code: 'ACH-PUDU',
                      name: 'Achariya School',
                      onTap: () {
                        _codeController.text = 'ACH-PUDU';
                        _login('ACH-PUDU');
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _DemoButton(
                      code: 'EDT-KAVI',
                      name: 'Kavitha R.',
                      onTap: () {
                        _codeController.text = 'EDT-KAVI';
                        _login('EDT-KAVI');
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              Center(
                child: Text(
                  'Connected to Q-School ERP &bull; Port 3100',
                  style: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: 11),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DemoButton extends StatelessWidget {
  final String code;
  final String name;
  final VoidCallback onTap;

  const _DemoButton({
    required this.code,
    required this.name,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Column(
          children: [
            Text(
              code,
              style: const TextStyle(
                color: QS.mint,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: Colors.white.withOpacity(0.6),
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
