import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class LearnScreen extends StatefulWidget {
  const LearnScreen({super.key});

  @override
  State<LearnScreen> createState() => _LearnScreenState();
}

class _LearnScreenState extends State<LearnScreen> {
  int _selectedFilter = 0;
  final List<String> _filters = const [
    'All',
    'Academic',
    'Life Skills',
    'Wellness',
    'Technology',
  ];

  final List<Map<String, dynamic>> _courses = [
    {
      'slug': 'mind-memory-mastery',
      'title': 'Mind & Memory Mastery',
      'instructor': 'Dr. Arjun Mehta',
      'rating': 4.8,
      'ratings': '1.2k',
      'price': '₹999',
      'art': Art.bulb,
    },
    {
      'slug': 'stress-management-for-students',
      'title': 'Stress Management for Students',
      'instructor': 'Rohit Sharma',
      'rating': 4.7,
      'ratings': '860',
      'price': '₹499',
      'art': Art.heart,
    },
    {
      'slug': 'effective-communication',
      'title': 'Effective Communication',
      'instructor': 'Priya Menon',
      'rating': 4.6,
      'ratings': '765',
      'price': '₹799',
      'art': Art.speech,
    },
    {
      'slug': 'time-management',
      'title': 'Time Management',
      'instructor': 'Dr. Meera Nair',
      'rating': 4.6,
      'ratings': '642',
      'price': '₹589',
      'art': Art.leader,
    },
    {
      'slug': 'creative-thinking-workshop',
      'title': 'Creative Thinking Workshop',
      'instructor': 'Neha Kapoor',
      'rating': 4.7,
      'ratings': '410',
      'price': '₹499',
      'art': Art.palette,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Page Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Learn',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: QS.ink,
                    ),
                  ),
                  Icon(Icons.tune_rounded, color: QS.ink, size: 24),
                ],
              ),
            ),

            // Search Field
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: SearchField(
                hint: 'Search for courses, topics or instructors...',
              ),
            ),
            const SizedBox(height: 16),

            // Filter Chips
            Padding(
              padding: const EdgeInsets.only(left: 20),
              child: FilterChips(
                items: _filters,
                value: _selectedFilter,
                onChanged: (i) => setState(() => _selectedFilter = i),
              ),
            ),
            const SizedBox(height: 16),

            // Course List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                itemCount: _courses.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final c = _courses[index];
                  return GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed(
                      '/course',
                      arguments: c['slug'],
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: QS.line),
                        boxShadow: [
                          BoxShadow(
                            color: fade(QS.ink, 0.03),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          // Thumbnail
                          ArtThumb(
                            art: c['art'],
                            width: 84,
                            height: 84,
                            radius: 14,
                          ),
                          const SizedBox(width: 14),

                          // Details
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        c['title'],
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 14.5,
                                          fontWeight: FontWeight.w700,
                                          color: QS.ink,
                                        ),
                                      ),
                                    ),
                                    const Icon(
                                      Icons.favorite_border_rounded,
                                      size: 18,
                                      color: QS.sub,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  c['instructor'],
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: QS.sub,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    const Icon(Icons.star_rounded,
                                        size: 14, color: QS.star),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${c['rating']} (${c['ratings']})',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: QS.ink,
                                      ),
                                    ),
                                    const Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: fade(QS.teal, 0.1),
                                        borderRadius:
                                            BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        c['price'],
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w800,
                                          color: QS.deep,
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
