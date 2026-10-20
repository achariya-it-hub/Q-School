import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  int _selectedTab = 0;

  final List<String> _tabs = const [
    'All',
    'Top Rated',
    'New',
    'Free',
    'Popular',
  ];

  final List<Map<String, dynamic>> _exploreGrid = [
    {
      'title': 'Academic Learning',
      'sub': 'Build a stronger foundation',
      'art': Art.building,
    },
    {
      'title': 'Life Skills',
      'sub': 'For a better tomorrow',
      'art': Art.pencil,
    },
    {
      'title': 'Mindfulness & Meditation',
      'sub': 'Inner peace, outer success',
      'art': Art.heart,
    },
    {
      'title': 'Creativity',
      'sub': 'Unlock your potential',
      'art': Art.palette,
    },
    {
      'title': 'Communication',
      'sub': 'Speak with confidence',
      'art': Art.speech,
    },
    {
      'title': 'Technology',
      'sub': 'Stay ahead of the digital world',
      'art': Art.laptop,
    },
    {
      'title': 'Wellness & Health',
      'sub': 'A healthier, happier you',
      'art': Art.leaf,
    },
    {
      'title': 'Career Growth',
      'sub': 'Skills for the future',
      'art': Art.leader,
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
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'Explore',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: QS.ink,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(Icons.search_rounded, color: QS.ink, size: 24),
                      SizedBox(width: 14),
                      Icon(Icons.tune_rounded, color: QS.ink, size: 24),
                    ],
                  ),
                ],
              ),
            ),

            // Tab Filter Chips
            Padding(
              padding: const EdgeInsets.only(left: 20),
              child: FilterChips(
                items: _tabs,
                value: _selectedTab,
                onChanged: (i) => setState(() => _selectedTab = i),
              ),
            ),
            const SizedBox(height: 16),

            // 2-Column Grid
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 0.88,
                ),
                itemCount: _exploreGrid.length,
                itemBuilder: (context, index) {
                  final item = _exploreGrid[index];
                  return GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed(
                      '/course',
                      arguments: 'design-thinking-for-young-minds',
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: embossedDecoration(
                        borderRadius: 18,
                        fill: const Color(0xFFFAFCFC),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: ArtThumb(
                              art: item['art'],
                              width: double.infinity,
                              radius: 14,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            item['title'],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w700,
                              color: QS.ink,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item['sub'],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 11,
                              color: QS.sub,
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
