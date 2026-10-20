import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';
import 'shell.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserRole>(
      valueListenable: userRole,
      builder: (context, role, _) {
        final isTeacher = role == UserRole.teacher;
        final isAdmin = role == UserRole.admin;

        final name = isAdmin
            ? 'Admin Console'
            : (isTeacher ? 'Prof. Alex Johnson' : 'Alex Johnson');
        final email = isAdmin
            ? 'admin@qschool.edu'
            : (isTeacher ? 'alex.prof@qschool.edu' : 'alex@gmail.com');
        final roleLabel = isAdmin ? 'Super Admin' : (isTeacher ? 'Teacher / Educator' : 'Student Learner');

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
                    Avatar(name: name, size: 60),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: QS.ink,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          email,
                          style: const TextStyle(fontSize: 13, color: QS.sub),
                        ),
                        const SizedBox(height: 6),
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
                      ],
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

                // Role Selector Switcher in Profile (Quick Role Switch for Testing)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: fade(QS.teal, 0.06),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: fade(QS.teal, 0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Switch Active Role Portal:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: QS.deep,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          _roleSwitchBtn(context, UserRole.student, 'Student'),
                          const SizedBox(width: 8),
                          _roleSwitchBtn(context, UserRole.teacher, 'Teacher'),
                          const SizedBox(width: 8),
                          _roleSwitchBtn(context, UserRole.admin, 'Admin'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

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
                _menuTile(context, Icons.handshake_outlined, 'Partnership & Referral Portal', () => Navigator.of(context).pushNamed('/partner')),
                _menuTile(context, Icons.notifications_none_rounded, 'Notifications', () => Navigator.of(context).pushNamed('/notifications')),
                _menuTile(context, Icons.help_outline_rounded, 'Help & Support', () => Navigator.of(context).pushNamed('/help_support')),
                _menuTile(context, Icons.tune_rounded, 'Settings', () => Navigator.of(context).pushNamed('/settings')),
                const SizedBox(height: 8),
                _menuTile(
                  context,
                  Icons.logout_rounded,
                  'Logout',
                  () => Navigator.of(context).pushNamed('/login'),
                  isRed: true,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _roleSwitchBtn(BuildContext context, UserRole targetRole, String label) {
    final active = userRole.value == targetRole;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          userRole.value = targetRole;
          appTab.value = 0;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                targetRole == UserRole.teacher
                    ? 'Switched to Teacher / Instructor Portal 👨‍🏫'
                    : (targetRole == UserRole.admin ? 'Switched to Admin Console 🛡️' : 'Switched to Student Learner Mode 🎓'),
              ),
              duration: const Duration(seconds: 2),
            ),
          );
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? QS.deep : Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: active ? QS.deep : QS.line),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: active ? FontWeight.w800 : FontWeight.w600,
              color: active ? Colors.white : QS.ink,
            ),
          ),
        ),
      ),
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
