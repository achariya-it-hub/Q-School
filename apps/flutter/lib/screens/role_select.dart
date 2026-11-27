import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import 'login.dart';

/// Second screen: who is signing in? Each choice opens that role's sign-in.
class RoleSelectScreen extends StatelessWidget {
  const RoleSelectScreen({super.key});

  // index matches LoginScreen's role numbers: 0 Student, 1 Teacher, 2 Admin, 3 Partner
  static const _roles = [
    (0, 'Student', 'Learn, attend live classes and track your progress', Icons.school_rounded),
    (3, 'Partner', 'Make admissions, share your code and track commission', Icons.handshake_rounded),
    (2, 'Admin', 'Manage leads, admissions, fees and reports', Icons.admin_panel_settings_rounded),
    (1, 'Teacher', 'Run classes, attendance and send receipts', Icons.co_present_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
          children: [
            const Center(child: QSchoolLogo(size: 84)),
            const SizedBox(height: 28),
            const Center(
              child: Text(
                'Welcome to Q-School',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: QS.ink),
              ),
            ),
            const SizedBox(height: 6),
            const Center(
              child: Text('Who is signing in?', style: TextStyle(fontSize: 14.5, color: QS.sub)),
            ),
            const SizedBox(height: 26),
            for (final r in _roles) ...[
              _RoleCard(
                title: r.$2,
                subtitle: r.$3,
                icon: r.$4,
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => LoginScreen(initialRole: r.$1)),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({required this.title, required this.subtitle, required this.icon, required this.onTap});

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: QS.line, width: 1.3),
          ),
          child: Row(
            children: [
              Container(
                height: 52,
                width: 52,
                decoration: BoxDecoration(color: const Color(0xFFE3F4F0), borderRadius: BorderRadius.circular(16)),
                child: Icon(icon, color: QS.teal, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: QS.ink)),
                    const SizedBox(height: 3),
                    Text(subtitle, style: const TextStyle(fontSize: 12.5, color: QS.sub, height: 1.3)),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: QS.sub),
            ],
          ),
        ),
      ),
    );
  }
}
