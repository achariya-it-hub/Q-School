import 'package:flutter/material.dart';
import '../theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<Map<String, dynamic>> _items = [
    {
      'title': '🔴 Live Class starting in 15 mins!',
      'body': 'Mind & Memory Mastery session with Dr. Arjun Mehta is live now.',
      'time': '10 mins ago',
      'unread': true,
      'typeIcon': Icons.live_tv_rounded,
      'color': QS.red,
    },
    {
      'title': '🎓 Certificate Issued!',
      'body': 'Congratulations! You have completed Design Thinking for Young Minds.',
      'time': '2 hours ago',
      'unread': true,
      'typeIcon': Icons.workspace_premium_rounded,
      'color': QS.gold,
    },
    {
      'title': '📝 New Assignment Graded',
      'body': 'Prof. Alex scored 95/100 on your Memory Palace reflection journal.',
      'time': 'Yesterday',
      'unread': false,
      'typeIcon': Icons.assignment_turned_in_rounded,
      'color': QS.teal,
    },
    {
      'title': '⚡ New Course Recommendation',
      'body': 'Neuroscience & Deep Focus is now available with 33% discount.',
      'time': '3 days ago',
      'unread': false,
      'typeIcon': Icons.auto_awesome_rounded,
      'color': QS.cyan,
    },
  ];

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
                    'Notifications',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        for (var item in _items) {
                          item['unread'] = false;
                        }
                      });
                    },
                    child: const Text(
                      'Mark all as read',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: QS.teal),
                    ),
                  ),
                ],
              ),
            ),

            // Notifications List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                itemCount: _items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: embossedDecoration(
                      fill: item['unread'] ? const Color(0xFFF0F9F7) : Colors.white,
                      borderRadius: 18,
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: fade(item['color'], 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(item['typeIcon'], size: 20, color: item['color'] == QS.gold ? QS.ink : item['color']),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item['title'],
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: item['unread'] ? FontWeight.w900 : FontWeight.w700,
                                        color: QS.ink,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    item['time'],
                                    style: const TextStyle(fontSize: 11, color: QS.sub),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['body'],
                                style: const TextStyle(fontSize: 12.5, color: QS.sub, height: 1.35),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
