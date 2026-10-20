import 'package:flutter/material.dart';
import '../theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notifications = true;
  bool _emailUpdates = true;
  bool _darkMode = false;
  bool _autoDownload = false;
  String _selectedLang = 'English (US)';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 20, 14),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_rounded, color: QS.ink, size: 24),
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Settings',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                children: [
                  // Section: Account
                  const Text(
                    'Account Settings',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: QS.sub),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    decoration: embossedDecoration(fill: Colors.white, borderRadius: 20),
                    child: Column(
                      children: [
                        _settingsTile(
                          icon: Icons.person_outline_rounded,
                          title: 'Edit Profile Information',
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: QS.line),
                        _settingsTile(
                          icon: Icons.lock_outline_rounded,
                          title: 'Security & Change Password',
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: QS.line),
                        _settingsTile(
                          icon: Icons.payment_rounded,
                          title: 'Saved Payment Methods',
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Section: Preferences
                  const Text(
                    'App Preferences',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: QS.sub),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    decoration: embossedDecoration(fill: Colors.white, borderRadius: 20),
                    child: Column(
                      children: [
                        _switchTile(
                          icon: Icons.notifications_active_outlined,
                          title: 'Push Notifications',
                          subtitle: 'Class alerts, live reminders & course news',
                          value: _notifications,
                          onChanged: (v) => setState(() => _notifications = v),
                        ),
                        const Divider(height: 1, color: QS.line),
                        _switchTile(
                          icon: Icons.mail_outline_rounded,
                          title: 'Email Digest',
                          subtitle: 'Weekly progress reports & certificates',
                          value: _emailUpdates,
                          onChanged: (v) => setState(() => _emailUpdates = v),
                        ),
                        const Divider(height: 1, color: QS.line),
                        _switchTile(
                          icon: Icons.dark_mode_outlined,
                          title: 'Dark Theme Mode',
                          subtitle: 'High contrast emerald night theme',
                          value: _darkMode,
                          onChanged: (v) => setState(() => _darkMode = v),
                        ),
                        const Divider(height: 1, color: QS.line),
                        _switchTile(
                          icon: Icons.wifi_protected_setup_rounded,
                          title: 'Auto-Download on Wi-Fi',
                          subtitle: 'Pre-download next lessons offline',
                          value: _autoDownload,
                          onChanged: (v) => setState(() => _autoDownload = v),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Section: App Info
                  const Text(
                    'About & System',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: QS.sub),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    decoration: embossedDecoration(fill: Colors.white, borderRadius: 20),
                    child: Column(
                      children: [
                        _settingsTile(
                          icon: Icons.language_rounded,
                          title: 'Language',
                          trailingText: _selectedLang,
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: QS.line),
                        _settingsTile(
                          icon: Icons.privacy_tip_outlined,
                          title: 'Privacy Policy & Terms',
                          onTap: () {},
                        ),
                        const Divider(height: 1, color: QS.line),
                        _settingsTile(
                          icon: Icons.info_outline_rounded,
                          title: 'Q-School App Version',
                          trailingText: 'v2.4.0 (Build 89)',
                          onTap: () {},
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _settingsTile({
    required IconData icon,
    required String title,
    String? trailingText,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: QS.teal, size: 22),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: QS.ink),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (trailingText != null)
            Text(trailingText, style: const TextStyle(fontSize: 12, color: QS.sub, fontWeight: FontWeight.w600)),
          const SizedBox(width: 6),
          const Icon(Icons.chevron_right_rounded, size: 20, color: QS.sub),
        ],
      ),
      onTap: onTap,
    );
  }

  Widget _switchTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      secondary: Icon(icon, color: QS.teal, size: 22),
      title: Text(
        title,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: QS.ink),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(fontSize: 11.5, color: QS.sub),
      ),
      activeTrackColor: QS.teal,
      value: value,
      onChanged: onChanged,
    );
  }
}
