import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data.dart';
import '../theme.dart';
import 'admin_dashboard.dart';
import 'explore.dart';
import 'home.dart';
import 'learn.dart';
import 'profile.dart';
import 'teacher_dashboard.dart';

/// Currently selected bottom tab index.
final appTab = ValueNotifier<int>(0);

/// Opens a hub destination: a named route, or `tab:N` to switch the bottom tab.
void openRoute(BuildContext context, String route) {
  if (route.startsWith('tab:')) {
    appTab.value = int.parse(route.substring(4));
  } else {
    Navigator.of(context).pushNamed(route);
  }
}

class AppShell extends StatelessWidget {
  const AppShell({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<UserRole>(
      valueListenable: userRole,
      builder: (context, role, _) {
        final List<Widget> pages = role == UserRole.teacher
            ? const [
                TeacherDashboardScreen(),
                LearnScreen(),
                ExploreScreen(),
                ProfileScreen(),
              ]
            : (role == UserRole.admin
                ? const [
                    AdminDashboardScreen(),
                    LearnScreen(),
                    ExploreScreen(),
                    ProfileScreen(),
                  ]
                : const [
                    HomeScreen(),
                    LearnScreen(),
                    ExploreScreen(),
                    ProfileScreen(),
                  ]);

        return ValueListenableBuilder<int>(
          valueListenable: appTab,
          builder: (context, index, _) => Scaffold(
            backgroundColor: const Color(0xFFF7FAF9),
            extendBody: true,
            body: IndexedStack(
              index: index > 3 ? 0 : index,
              children: pages,
            ),
            bottomNavigationBar: QSTabBar(
              role: role,
              index: index,
              onTap: (i) {
                HapticFeedback.selectionClick();
                if (i == 2) {
                  // Central Q Floating Action opens AI Assistant!
                  Navigator.of(context).pushNamed('/ai_assistant');
                } else {
                  appTab.value = i > 2 ? i - 1 : i;
                }
              },
            ),
          ),
        );
      },
    );
  }
}

class _TabSpec {
  final String label;
  final IconData on;
  final IconData off;
  const _TabSpec(this.label, this.on, this.off);
}

class QSTabBar extends StatelessWidget {
  const QSTabBar({
    super.key,
    required this.role,
    required this.index,
    required this.onTap,
  });

  final UserRole role;
  final int index;
  final ValueChanged<int> onTap;

  List<_TabSpec> get _tabs {
    if (role == UserRole.teacher) {
      return const [
        _TabSpec('Dashboard', Icons.dashboard_rounded, Icons.dashboard_outlined),
        _TabSpec('Classes', Icons.menu_book_rounded, Icons.menu_book_outlined),
        _TabSpec('Q-Master', Icons.auto_awesome_rounded, Icons.auto_awesome_outlined),
        _TabSpec('Students', Icons.groups_rounded, Icons.groups_outlined),
        _TabSpec('Profile', Icons.person_rounded, Icons.person_outline_rounded),
      ];
    } else if (role == UserRole.admin) {
      return const [
        _TabSpec('Console', Icons.admin_panel_settings_rounded, Icons.admin_panel_settings_outlined),
        _TabSpec('Courses', Icons.menu_book_rounded, Icons.menu_book_outlined),
        _TabSpec('Q-Master', Icons.auto_awesome_rounded, Icons.auto_awesome_outlined),
        _TabSpec('Analytics', Icons.insights_rounded, Icons.insights_outlined),
        _TabSpec('Profile', Icons.person_rounded, Icons.person_outline_rounded),
      ];
    }
    return const [
      _TabSpec('Home', Icons.home_rounded, Icons.home_outlined),
      _TabSpec('Learn', Icons.menu_book_rounded, Icons.menu_book_outlined),
      _TabSpec('Q-Master', Icons.auto_awesome_rounded, Icons.auto_awesome_outlined),
      _TabSpec('Explore', Icons.explore_rounded, Icons.explore_outlined),
      _TabSpec('Profile', Icons.person_rounded, Icons.person_outline_rounded),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).padding.bottom;
    final mappedIndex = index >= 2 ? index + 1 : index;

    return SizedBox(
      height: 70 + bottom + 22,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          Container(
            height: 70 + bottom,
            padding: EdgeInsets.only(bottom: bottom),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border.all(color: const Color(0xFFEEF3F1), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: fade(QS.deep, 0.10),
                  blurRadius: 18,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: Row(
              children: [
                for (var i = 0; i < _tabs.length; i++)
                  Expanded(
                    child: i == 2
                        ? const SizedBox()
                        : _TabItem(
                            spec: _tabs[i],
                            focused: i == mappedIndex,
                            onTap: () => onTap(i),
                          ),
                  ),
              ],
            ),
          ),
          Positioned(
            top: 0,
            child: GestureDetector(
              onTap: () => onTap(2),
              child: Container(
                padding: const EdgeInsets.all(5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: fade(QS.deep, 0.35),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Container(
                  width: 58,
                  height: 58,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [Color(0xFF00F2C3), Color(0xFF0E937E), QS.deep],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: 34,
                      height: 34,
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: ClipOval(
                        child: Image.asset(
                          'assets/images/logo-mark.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabItem extends StatelessWidget {
  const _TabItem(
      {required this.spec, required this.focused, required this.onTap});
  final _TabSpec spec;
  final bool focused;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = focused ? QS.teal : const Color(0xFF7C8C88);
    return InkResponse(
      onTap: onTap,
      radius: 32,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedSlide(
            offset: Offset(0, focused ? -0.08 : 0),
            duration: const Duration(milliseconds: 200),
            child: Icon(focused ? spec.on : spec.off, color: color, size: 24),
          ),
          const SizedBox(height: 3),
          Text(
            spec.label,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: focused ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          AnimatedOpacity(
            opacity: focused ? 1 : 0,
            duration: const Duration(milliseconds: 200),
            child: Container(
              width: 4,
              height: 4,
              decoration: const BoxDecoration(
                color: QS.teal,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
