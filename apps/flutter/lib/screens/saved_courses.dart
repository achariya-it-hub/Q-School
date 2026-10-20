import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class SavedCoursesScreen extends StatefulWidget {
  const SavedCoursesScreen({super.key});

  @override
  State<SavedCoursesScreen> createState() => _SavedCoursesScreenState();
}

class _SavedCoursesScreenState extends State<SavedCoursesScreen> {
  final List<Map<String, dynamic>> _saved = [
    {
      'title': 'Design Thinking for Young Minds',
      'instructor': 'Neha Kapoor',
      'rating': 4.7,
      'students': '410',
      'price': '₹1,499',
      'art': Art.palette,
    },
    {
      'title': 'Public Speaking & Confidence Masterclass',
      'instructor': 'Kabir Sharma',
      'rating': 4.9,
      'students': '890',
      'price': '₹899',
      'art': Art.speech,
    },
    {
      'title': 'Creative Problem Solving in Tech',
      'instructor': 'Dr. Vikram Seth',
      'rating': 4.8,
      'students': '620',
      'price': '₹1,199',
      'art': Art.laptop,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
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
                    'Saved Courses',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: embossedDecoration(
                      fill: Colors.white,
                      borderRadius: 12,
                    ),
                    child: Text(
                      '${_saved.length} Items',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: QS.deep),
                    ),
                  ),
                ],
              ),
            ),

            if (_saved.isEmpty)
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(Icons.bookmark_border_rounded, size: 64, color: QS.sub),
                      SizedBox(height: 12),
                      Text(
                        'No Saved Courses Yet',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: QS.ink),
                      ),
                      SizedBox(height: 4),
                      Text('Courses you bookmark will appear here.', style: TextStyle(fontSize: 12, color: QS.sub)),
                    ],
                  ),
                ),
              )
            else
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                  itemCount: _saved.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    final item = _saved[index];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: embossedDecoration(
                        fill: Colors.white,
                        borderRadius: 20,
                      ),
                      child: Row(
                        children: [
                          ArtThumb(art: item['art'], width: 85, height: 85, radius: 14),
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
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 14.5,
                                          fontWeight: FontWeight.w800,
                                          color: QS.ink,
                                        ),
                                      ),
                                    ),
                                    IconButton(
                                      constraints: const BoxConstraints(),
                                      padding: EdgeInsets.zero,
                                      icon: const Icon(Icons.bookmark_rounded, color: QS.teal, size: 20),
                                      onPressed: () {
                                        setState(() {
                                          _saved.removeAt(index);
                                        });
                                      },
                                    ),
                                  ],
                                ),
                                Text(
                                  item['instructor'],
                                  style: const TextStyle(fontSize: 12, color: QS.sub),
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    Stars(rating: item['rating'], count: item['students']),
                                    const Spacer(),
                                    Text(
                                      item['price'],
                                      style: const TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w900,
                                        color: QS.deep,
                                      ),
                                    ),
                                  ],
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
