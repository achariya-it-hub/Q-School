import 'package:flutter/material.dart';
import '../theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _activeFilter = 'all'; // 'all', 'unread', 'important'
  final Set<int> _expandedIndices = {0}; // First one expanded by default

  final List<Map<String, dynamic>> _items = [
    {
      'id': 'notif_1',
      'title': '🔴 Live Class starting in 15 mins!',
      'summary': 'Mind & Memory Mastery session with Dr. Arjun Mehta is live now.',
      'body':
          'Dr. Arjun Mehta\'s interactive session on "Mind & Memory Mastery: The Ancient Yogic Science of Mnemonic Recall" is scheduled to begin at 04:00 PM.\n\nKey topics covered today:\n• Neuroplasticity & Memory Palace indexing\n• Breath modulation for mental focus (Pranayama)\n• Live Q&A and practical concentration drills\n\nPlease join 5 minutes early to test your audio and video feed.',
      'sender': 'Academic Dept • Dr. Arjun Mehta',
      'category': 'Live Class',
      'time': '10 mins ago',
      'date': 'Today, 03:45 PM',
      'unread': true,
      'important': true,
      'typeIcon': Icons.live_tv_rounded,
      'color': QS.red,
      'actionLabel': 'Join Live Class',
      'route': '/live-class',
    },
    {
      'id': 'notif_2',
      'title': '🎓 Certificate Issued!',
      'summary': 'Congratulations! You have completed Design Thinking for Young Minds.',
      'body':
          'Official Certificate of Completion (Cert ID: QS-2026-CERT-0089) has been generated and digitally verified by the Divine Grace Foundation Academic Council.\n\nYour scores and remarks:\n• Aggregate Score: 96%\n• Distinction in Creative Problem Solving\n• QR Verification: Verified on Blockchain\n\nYou can share this credential directly on your LinkedIn profile or download a high-resolution PDF for your portfolio.',
      'sender': 'Exam & Certification Cell',
      'category': 'Certificate',
      'time': '2 hours ago',
      'date': 'Today, 01:30 PM',
      'unread': true,
      'important': true,
      'typeIcon': Icons.workspace_premium_rounded,
      'color': QS.gold,
      'actionLabel': 'View Certificate',
      'route': '/app',
    },
    {
      'id': 'notif_3',
      'title': '📝 New Assignment Graded',
      'summary': 'Prof. Alex scored 95/100 on your Memory Palace reflection journal.',
      'body':
          'Your submission for "Weekly Reflective Journal: Spatial Anchors & Mnemonic Indexing" has been reviewed and graded.\n\nEvaluation Feedback:\n"Exceptional demonstration of sensory association and spatial recall! Your spatial roadmap diagram was particularly insightful. Minor note: practice the reverse traversal drill once more to increase recall speed."\n\nGrade: A+ (95/100)',
      'sender': 'Faculty Review • Prof. Alex',
      'category': 'Academics',
      'time': 'Yesterday',
      'date': 'Nov 1, 05:20 PM',
      'unread': false,
      'important': false,
      'typeIcon': Icons.assignment_turned_in_rounded,
      'color': QS.teal,
      'actionLabel': 'View Feedback',
      'route': null,
    },
    {
      'id': 'notif_4',
      'title': '⚡ New Quantum Schooling Module Available',
      'summary': 'Divya Tratak Gazing & Laser Focus is now unlocked for your grade.',
      'body':
          'The curriculum council has unlocked Module 4: "Divya Tratak — Visual Fixation & Willpower Mastery".\n\nCurriculum Outline:\n1. Introduction to Bindu Tratak and Jyoti Tratak\n2. Eye exercises to eliminate optical strain\n3. Deep concentration drills with alpha-wave resonance\n\nAccess the lesson module from the Quantum Schooling course syllabus.',
      'sender': 'Curriculum Council',
      'category': 'Curriculum',
      'time': '3 days ago',
      'date': 'Oct 30, 11:00 AM',
      'unread': false,
      'important': false,
      'typeIcon': Icons.auto_awesome_rounded,
      'color': QS.cyan,
      'actionLabel': 'Explore Module',
      'route': '/courses',
    },
  ];

  int get _unreadCount => _items.where((i) => i['unread'] == true).length;

  List<Map<String, dynamic>> get _filteredItems {
    if (_activeFilter == 'unread') {
      return _items.where((i) => i['unread'] == true).toList();
    }
    if (_activeFilter == 'important') {
      return _items.where((i) => i['important'] == true).toList();
    }
    return _items;
  }

  void _toggleExpand(int originalIndex) {
    setState(() {
      if (_expandedIndices.contains(originalIndex)) {
        _expandedIndices.remove(originalIndex);
      } else {
        _expandedIndices.add(originalIndex);
      }
      _items[originalIndex]['unread'] = false;
    });
  }

  void _openMessageReader(Map<String, dynamic> item) {
    setState(() => item['unread'] = false);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            // Handle bar
            const SizedBox(height: 12),
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: QS.line,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Reader Header
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 16, 20, 14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: fade(item['color'], 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      item['typeIcon'],
                      size: 22,
                      color: item['color'] == QS.gold ? QS.ink : item['color'],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['category'],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: item['color'] == QS.gold ? QS.teal : item['color'],
                          ),
                        ),
                        Text(
                          item['date'],
                          style: const TextStyle(fontSize: 12, color: QS.sub),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: QS.sub, size: 24),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: QS.line),
            // Reader Content
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 18),
                children: [
                  Text(
                    item['title'],
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      const Icon(Icons.verified_user_outlined, size: 14, color: QS.teal),
                      const SizedBox(width: 6),
                      Text(
                        item['sender'],
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: QS.teal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7FAF9),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: QS.line),
                    ),
                    child: Text(
                      item['body'],
                      style: const TextStyle(
                        fontSize: 14.5,
                        color: QS.ink,
                        height: 1.55,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Action button in reader
            if (item['actionLabel'] != null)
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: QS.deep,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        if (item['route'] != null) {
                          Navigator.of(context).pushNamed(item['route']);
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Opening ${item['actionLabel']}...'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        }
                      },
                      child: Text(
                        item['actionLabel'],
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Top Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 20, 12),
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
                  if (_unreadCount > 0)
                    TextButton(
                      onPressed: () {
                        setState(() {
                          for (var item in _items) {
                            item['unread'] = false;
                          }
                        });
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        minimumSize: Size.zero,
                      ),
                      child: const Text(
                        'Mark all as read',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: QS.teal,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Filter Tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: [
                  _filterChip('all', 'All (${_items.length})'),
                  const SizedBox(width: 8),
                  _filterChip('unread', 'Unread (${_unreadCount})'),
                  const SizedBox(width: 8),
                  _filterChip('important', 'Important'),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Notifications List
            Expanded(
              child: _filteredItems.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.notifications_off_outlined, size: 48, color: QS.sub),
                          SizedBox(height: 12),
                          Text(
                            'No notifications in this filter',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: QS.ink),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'You\'re completely caught up!',
                            style: TextStyle(fontSize: 12.5, color: QS.sub),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(20, 6, 20, 100),
                      itemCount: _filteredItems.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final item = _filteredItems[index];
                        final originalIndex = _items.indexOf(item);
                        final isExpanded = _expandedIndices.contains(originalIndex);

                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => _toggleExpand(originalIndex),
                            borderRadius: BorderRadius.circular(18),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 220),
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: isExpanded
                                    ? Colors.white
                                    : (item['unread'] ? const Color(0xFFEFF8F5) : Colors.white),
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(
                                  color: isExpanded
                                      ? QS.teal.withOpacity(0.4)
                                      : (item['unread'] ? QS.teal.withOpacity(0.2) : QS.line),
                                  width: isExpanded ? 1.4 : 1.0,
                                ),
                                boxShadow: isExpanded
                                    ? [
                                        BoxShadow(
                                          color: QS.deep.withOpacity(0.08),
                                          blurRadius: 16,
                                          offset: const Offset(0, 4),
                                        ),
                                      ]
                                    : [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.02),
                                          blurRadius: 6,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Top row with Icon, Title, and Chevron
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: fade(item['color'], 0.15),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          item['typeIcon'],
                                          size: 20,
                                          color: item['color'] == QS.gold ? QS.ink : item['color'],
                                        ),
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
                                                      fontSize: 14.5,
                                                      fontWeight: item['unread']
                                                          ? FontWeight.w900
                                                          : FontWeight.w700,
                                                      color: QS.ink,
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                  item['time'],
                                                  style: const TextStyle(fontSize: 11, color: QS.sub),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 3),
                                            Text(
                                              item['category'],
                                              style: TextStyle(
                                                fontSize: 10.5,
                                                fontWeight: FontWeight.w700,
                                                color: item['color'] == QS.gold ? QS.teal : item['color'],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Icon(
                                        isExpanded
                                            ? Icons.keyboard_arrow_up_rounded
                                            : Icons.keyboard_arrow_down_rounded,
                                        color: isExpanded ? QS.teal : QS.sub,
                                        size: 20,
                                      ),
                                    ],
                                  ),

                                  // Summary preview when collapsed
                                  if (!isExpanded) ...[
                                    const SizedBox(height: 8),
                                    Padding(
                                      padding: const EdgeInsets.only(left: 48),
                                      child: Text(
                                        item['summary'],
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 12.5,
                                          color: QS.sub,
                                          height: 1.35,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Padding(
                                      padding: const EdgeInsets.only(left: 48),
                                      child: Row(
                                        children: [
                                          const Text(
                                            'Tap to expand & read message',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w700,
                                              color: QS.teal,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.arrow_forward, size: 11, color: QS.teal),
                                          const Spacer(),
                                          if (item['unread'])
                                            Container(
                                              width: 8,
                                              height: 8,
                                              decoration: const BoxDecoration(
                                                color: QS.teal,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],

                                  // Expanded Content: Highly readable formatted message
                                  if (isExpanded) ...[
                                    const SizedBox(height: 14),
                                    Container(
                                      width: double.infinity,
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF7FAF9),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(color: QS.line),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              const Icon(Icons.person_outline_rounded,
                                                  size: 13, color: QS.sub),
                                              const SizedBox(width: 5),
                                              Expanded(
                                                child: Text(
                                                  item['sender'],
                                                  style: const TextStyle(
                                                    fontSize: 11.5,
                                                    fontWeight: FontWeight.w600,
                                                    color: QS.sub,
                                                  ),
                                                ),
                                              ),
                                              Text(
                                                item['date'],
                                                style: const TextStyle(
                                                  fontSize: 11,
                                                  color: QS.sub,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const Divider(height: 16, color: QS.line),
                                          Text(
                                            item['body'],
                                            style: const TextStyle(
                                              fontSize: 13.5,
                                              color: QS.ink,
                                              height: 1.5,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    // Action buttons row
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        TextButton.icon(
                                          onPressed: () => _openMessageReader(item),
                                          icon: const Icon(Icons.open_in_full_rounded,
                                              size: 14, color: QS.teal),
                                          label: const Text(
                                            'Full Reader',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.bold,
                                              color: QS.teal,
                                            ),
                                          ),
                                        ),
                                        if (item['actionLabel'] != null) ...[
                                          const SizedBox(width: 8),
                                          ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: QS.deep,
                                              elevation: 0,
                                              padding: const EdgeInsets.symmetric(
                                                  horizontal: 14, vertical: 8),
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(10),
                                              ),
                                            ),
                                            onPressed: () {
                                              if (item['route'] != null) {
                                                Navigator.of(context).pushNamed(item['route']);
                                              } else {
                                                ScaffoldMessenger.of(context).showSnackBar(
                                                  SnackBar(
                                                    content: Text('Opening ${item['actionLabel']}...'),
                                                    duration: const Duration(seconds: 2),
                                                  ),
                                                );
                                              }
                                            },
                                            child: Text(
                                              item['actionLabel'],
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
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

  Widget _filterChip(String filterKey, String label) {
    final active = _activeFilter == filterKey;
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = filterKey),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? QS.deep : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: active ? QS.deep : QS.line),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: active ? Colors.white : QS.sub,
          ),
        ),
      ),
    );
  }
}
