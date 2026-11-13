import 'package:flutter/material.dart';
import '../data.dart';
import '../services/google_auth_service.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserRole>(
      valueListenable: userRole,
      builder: (context, role, _) {
        return ValueListenableBuilder<AuthUser?>(
          valueListenable: currentUser,
          builder: (context, auth, _) {
            final isTeacher = role == UserRole.teacher;
            final isAdmin = role == UserRole.admin;

            final defaultName = isAdmin
                ? 'Admin Console'
                : (isTeacher ? 'Prof. Alex Johnson' : 'Alex Johnson');
            final defaultEmail = isAdmin
                ? 'admin@qschool.edu'
                : (isTeacher ? 'alex.prof@qschool.edu' : 'alex@gmail.com');

            final name = auth?.name ?? defaultName;
            final email = auth?.email ?? defaultEmail;
            final roleLabel = isAdmin
                ? 'Super Admin'
                : (isTeacher ? 'Teacher / Educator' : 'Student Learner');

            return Scaffold(
              backgroundColor: const Color(0xFFF7FAF9),
              body: SafeArea(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Profile',
                          style: TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: QS.ink,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.settings_outlined, color: QS.ink, size: 24),
                          onPressed: () => Navigator.of(context).pushNamed('/settings'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // User Info Card
                    Row(
                      children: [
                        Avatar(name: name, photoUrl: auth?.photoUrl, size: 60),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                  color: QS.ink,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                email,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 13, color: QS.sub),
                              ),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: fade(QS.teal, 0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      roleLabel,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                        color: QS.teal,
                                      ),
                                    ),
                                  ),
                                  if (auth?.provider == 'google')
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFE8F0FE),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        '✓ Gmail Connected',
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF1A73E8),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                const SizedBox(height: 24),

                // Stats Row Container
                Container(
                  padding:
                      const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: QS.line, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: fade(QS.deep, 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: isTeacher
                        ? const [
                            _StatBox('4', 'Active Classes'),
                            _VerticalLine(),
                            _StatBox('280', 'Students'),
                            _VerticalLine(),
                            _StatBox('₹42.5K', 'Earnings'),
                          ]
                        : (isAdmin
                            ? const [
                                _StatBox('12.4K', 'Total Users'),
                                _VerticalLine(),
                                _StatBox('185', 'Courses'),
                                _VerticalLine(),
                                _StatBox('₹8.4L', 'Revenue'),
                              ]
                            : const [
                                _StatBox('12', 'Courses'),
                                _VerticalLine(),
                                _StatBox('5', 'Certificates'),
                                _VerticalLine(),
                                _StatBox('120', 'Hours'),
                              ]),
                  ),
                ),
                const SizedBox(height: 24),

                // Menu Items List
                if (isTeacher) ...[
                  _menuTile(context, Icons.dashboard_outlined, 'Teacher Dashboard', () => Navigator.of(context).pushNamed('/app')),
                  _menuTile(context, Icons.video_camera_front_outlined, 'Live Studio & Webinars', () => Navigator.of(context).pushNamed('/live')),
                  _menuTile(context, Icons.assignment_outlined, 'Assignments & Grading', () => Navigator.of(context).pushNamed('/notes')),
                  _menuTile(context, Icons.payments_outlined, 'Payouts & Earnings', () => Navigator.of(context).pushNamed('/orders')),
                ] else if (isAdmin) ...[
                  _menuTile(context, Icons.admin_panel_settings_outlined, 'Admin Console', () => Navigator.of(context).pushNamed('/app')),
                  _menuTile(context, Icons.people_outline_rounded, 'User Access Control', () => Navigator.of(context).pushNamed('/settings')),
                  _menuTile(context, Icons.discount_outlined, 'Billing Discounts Config', () => Navigator.of(context).pushNamed('/orders')),
                  _menuTile(context, Icons.insights_outlined, 'Platform Revenue Analytics', () => Navigator.of(context).pushNamed('/orders')),
                ] else ...[
                  _menuTile(context, Icons.shopping_bag_outlined, 'My Orders', () => Navigator.of(context).pushNamed('/orders')),
                  _menuTile(context, Icons.workspace_premium_outlined, 'My Certificates', () => Navigator.of(context).pushNamed('/certificates')),
                  _menuTile(context, Icons.bookmark_border_rounded, 'Saved Courses', () => Navigator.of(context).pushNamed('/saved_courses')),
                  _menuTile(context, Icons.note_alt_outlined, 'My Notes', () => Navigator.of(context).pushNamed('/notes')),
                  _menuTile(context, Icons.file_download_outlined, 'Downloads', () => Navigator.of(context).pushNamed('/offline')),
                ],
                _menuTile(context, Icons.notifications_none_rounded, 'Notifications', () => Navigator.of(context).pushNamed('/notifications')),
                _menuTile(context, Icons.help_outline_rounded, 'Help & Support', () => Navigator.of(context).pushNamed('/help_support')),
                _menuTile(context, Icons.tune_rounded, 'Settings', () => Navigator.of(context).pushNamed('/settings')),
                const SizedBox(height: 8),
                _menuTile(
                  context,
                  Icons.logout_rounded,
                  'Logout',
                  () async {
                    await GoogleAuthService.instance.signOut();
                    if (!context.mounted) return;
                    Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
                  },
                  isRed: true,
                ),
              ],
            ),
          ),
        );
          },
        );
      },
    );
  }

  Widget _menuTile(BuildContext context, IconData icon, String label,
      VoidCallback onTap,
      {bool isRed = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0xFFF1F5F4))),
        ),
        child: Row(
          children: [
            Icon(icon, size: 22, color: isRed ? QS.red : QS.sub),
            const SizedBox(width: 14),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isRed ? QS.red : QS.ink,
              ),
            ),
            const Spacer(),
            Icon(
              Icons.chevron_right_rounded,
              size: 20,
              color: isRed ? QS.red : QS.sub,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  const _StatBox(this.num, this.label);
  final String num;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          num,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: QS.deep,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
              fontSize: 11.5, color: QS.sub, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _VerticalLine extends StatelessWidget {
  const _VerticalLine();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      width: 1,
      color: QS.line,
    );
  }
}
