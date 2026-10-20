import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, this.slug});
  final String? slug;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  int _selectedTab = 0;
  final List<String> _tabs = const ['Overview', 'Curriculum', 'Instructor', 'Reviews'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.only(bottom: 24),
                children: [
                  // Top Video Preview Header Banner
                  Stack(
                    children: [
                      Container(
                        height: 230,
                        width: double.infinity,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF021915), Color(0xFF042B25), Color(0xFF0E937E)],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                        child: Stack(
                          alignment: Alignment.center,
                          children: [
                            const Icon(
                              Icons.psychology_rounded,
                              size: 120,
                              color: QS.mint,
                            ),
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white,
                                boxShadow: [
                                  BoxShadow(
                                    color: fade(QS.mint, 0.5),
                                    blurRadius: 20,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.play_arrow_rounded,
                                color: QS.deep,
                                size: 40,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Top Action Overlay Buttons
                      Positioned(
                        top: 14,
                        left: 16,
                        right: 16,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            CircleAvatar(
                              backgroundColor: fade(Colors.black, 0.5),
                              child: IconButton(
                                icon: const Icon(Icons.arrow_back_rounded,
                                    color: Colors.white, size: 20),
                                onPressed: () => Navigator.of(context).maybePop(),
                              ),
                            ),
                            Row(
                              children: [
                                CircleAvatar(
                                  backgroundColor: fade(Colors.black, 0.5),
                                  child: IconButton(
                                    icon: const Icon(Icons.share_rounded,
                                        color: Colors.white, size: 20),
                                    onPressed: () {},
                                  ),
                                ),
                                const SizedBox(width: 10),
                                CircleAvatar(
                                  backgroundColor: fade(Colors.black, 0.5),
                                  child: IconButton(
                                    icon: const Icon(Icons.favorite_border_rounded,
                                        color: Colors.white, size: 20),
                                    onPressed: () {},
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // Course Info Section
                  Padding(
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Mind & Memory Mastery',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: QS.ink,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Neuroscience for Everyday Life',
                          style: TextStyle(
                            fontSize: 14.5,
                            color: QS.sub,
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Rating & Bestseller Badge
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, size: 18, color: QS.star),
                            const SizedBox(width: 4),
                            const Text(
                              '4.8',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: QS.ink,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Text(
                              '(1.2k students)',
                              style: TextStyle(fontSize: 13, color: QS.sub),
                            ),
                            const SizedBox(width: 12),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: QS.goldGradient,
                                borderRadius: BorderRadius.circular(8),
                                boxShadow: [
                                  BoxShadow(
                                    color: fade(QS.gold, 0.4),
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                              child: const Text(
                                'Bestseller',
                                style: TextStyle(
                                  color: QS.deep,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 22),

                        // Underline Tabs
                        UnderlineTabs(
                          items: _tabs,
                          value: _selectedTab,
                          onChanged: (i) => setState(() => _selectedTab = i),
                        ),
                        const SizedBox(height: 22),

                        // Key Stats Grid Cards
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: const [
                            _StatItem(Icons.play_circle_outline_rounded, '10 Lessons'),
                            _StatItem(Icons.schedule_rounded, '6 Hours'),
                            _StatItem(Icons.workspace_premium_rounded, 'Certificate'),
                            _StatItem(Icons.all_inclusive_rounded, 'Lifetime Access'),
                          ],
                        ),
                        const SizedBox(height: 26),

                        // About this course
                        const Text(
                          'About this course',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: QS.ink,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Unlocking the brain’s full potential is an art and science. Learn how your brain works, memory techniques, focus drills, and practical tools for academic & professional excellence.',
                          style: TextStyle(
                            fontSize: 13.5,
                            color: QS.body,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 22),

                        // What you will learn
                        const Text(
                          'What you will learn',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: QS.ink,
                          ),
                        ),
                        const SizedBox(height: 14),
                        _checkItem('How memory works & brain science'),
                        _checkItem('Scientific learning & recall techniques'),
                        _checkItem('Practical exercises for daily life'),
                        _checkItem('Improve focus and concentration span'),
                        _checkItem('Apply strategies for academic success'),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Sticky Bottom Pricing & Action Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.deep, 0.1),
                    blurRadius: 16,
                    offset: const Offset(0, -6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        children: const [
                          Text(
                            '₹999 ',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w900,
                              color: QS.deep,
                            ),
                          ),
                          Text(
                            '₹1,499',
                            style: TextStyle(
                              fontSize: 13,
                              color: QS.sub,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: fade(QS.teal, 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          '33% OFF',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w900,
                            color: QS.teal,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  // Buy Now Button
                  GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed('/payment'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 28, vertical: 14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF10A48E), Color(0xFF0E937E), Color(0xFF042B25)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: fade(Colors.white, 0.4), width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: fade(Colors.white, 0.6),
                            blurRadius: 2,
                            offset: const Offset(0, -2),
                          ),
                          BoxShadow(
                            color: fade(QS.deep, 0.38),
                            blurRadius: 14,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Text(
                        'Buy Now',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
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

  Widget _checkItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(3),
            decoration: const BoxDecoration(
              color: QS.teal,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded, size: 12, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                  fontSize: 13.5, color: QS.ink, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  const _StatItem(this.icon, this.label);
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: embossedDecoration(
            fill: const Color(0xFFF4FAF8),
            borderRadius: 14,
          ),
          child: Icon(icon, size: 24, color: QS.deep),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
              fontSize: 11.5, color: QS.sub, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}
