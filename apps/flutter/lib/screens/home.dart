import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';
import 'shell.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
          children: [
            // Top Glossy App Bar with Brand Logo & Action Buttons
            Row(
              children: [
                const QSchoolLogo(size: 34, showTagline: false),
                const Spacer(),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    border: Border.all(color: QS.line),
                    boxShadow: [
                      BoxShadow(
                        color: fade(QS.deep, 0.05),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: IconButton(
                    padding: EdgeInsets.zero,
                    icon: const Icon(Icons.search_rounded, color: QS.ink, size: 22),
                    onPressed: () => openRoute(context, 'tab:1'),
                  ),
                ),
                const SizedBox(width: 10),
                Stack(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: QS.line),
                        boxShadow: [
                          BoxShadow(
                            color: fade(QS.deep, 0.05),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: const Icon(Icons.notifications_none_rounded,
                            color: QS.ink, size: 22),
                        onPressed: () => Navigator.of(context).pushNamed('/notifications'),
                      ),
                    ),
                    Positioned(
                      right: 4,
                      top: 4,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: QS.red,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                const Avatar(name: 'Alex Johnson', size: 40),
              ],
            ),
            const SizedBox(height: 22),

            // Greeting Section
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Good morning,',
                  style: TextStyle(
                    fontSize: 13.5,
                    color: QS.sub,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 2),
                Row(
                  children: [
                    Text(
                      'Alex ',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: QS.ink,
                      ),
                    ),
                    Text(
                      '☀️',
                      style: TextStyle(fontSize: 22),
                    ),
                  ],
                ),
                SizedBox(height: 2),
                Text(
                  'Keep learning, keep growing',
                  style: TextStyle(
                    fontSize: 13,
                    color: QS.sub,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 22),

            // Ultra-Luxurious Hero Section with Glittering Icons
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: fade(Colors.white, 0.4), width: 1.6),
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.teal, 0.38),
                    blurRadius: 22,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(26),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: Image.asset(
                        'assets/images/mindfulness_hero.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              fade(QS.deep, 0.92),
                              fade(QS.deep, 0.72),
                              fade(QS.deep, 0.25),
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(22),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 5),
                                decoration: BoxDecoration(
                                  color: fade(Colors.black, 0.45),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                      color: fade(Colors.white, 0.25), width: 1),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: const [
                                    GlitterIcon(
                                      icon: Icons.auto_awesome_rounded,
                                      size: 16,
                                      color: QS.gold,
                                      glowColor: QS.gold,
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      'FEATURED PROGRAM',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: fade(QS.mint, 0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: fade(QS.mint, 0.4)),
                                ),
                                child: Row(
                                  children: const [
                                    GlitterIcon(icon: Icons.local_fire_department_rounded, size: 14, color: QS.mint, glowColor: QS.mint),
                                    SizedBox(width: 4),
                                    Text(
                                      '1.2k Live Now',
                                      style: TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w800),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Mindfulness\nfor a Better You',
                            style: TextStyle(
                              fontSize: 25,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              height: 1.2,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Live sessions • Practical tools • Expert guidance',
                            style: TextStyle(
                              fontSize: 13,
                              color: fade(Colors.white, 0.95),
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 22),
                          Row(
                            children: [
                              GestureDetector(
                                onTap: () => Navigator.of(context).pushNamed('/live'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20, vertical: 12),
                                  decoration: BoxDecoration(
                                    gradient: QS.goldGradient,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: fade(Colors.white, 0.6), width: 1.2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: fade(QS.gold, 0.45),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: const [
                                      Text(
                                        'Join Live Session',
                                        style: TextStyle(
                                          color: QS.deep,
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.w900,
                                        ),
                                      ),
                                      SizedBox(width: 6),
                                      GlitterIcon(
                                        icon: Icons.play_arrow_rounded,
                                        size: 18,
                                        color: QS.deep,
                                        glowColor: QS.amber,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              GestureDetector(
                                onTap: () => openRoute(context, 'tab:1'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  decoration: BoxDecoration(
                                    color: fade(Colors.white, 0.15),
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: fade(Colors.white, 0.35)),
                                  ),
                                  child: const Text(
                                    'Explore',
                                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w800),
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
            ),
            const SizedBox(height: 24),

            // 2x4 Feature Hub Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 4,
              mainAxisSpacing: 16,
              crossAxisSpacing: 10,
              childAspectRatio: 0.71,
              children: [
                _hubTile(
                  context,
                  label: 'Courses',
                  icon: Icons.menu_book_rounded,
                  colors: const [Color(0xFFFF7E5F), Color(0xFFFEB47B)],
                  onTap: () => openRoute(context, 'tab:1'),
                ),
                _hubTile(
                  context,
                  label: 'Live Classes',
                  icon: Icons.live_tv_rounded,
                  colors: const [Color(0xFFFF4B2B), Color(0xFFFF416C)],
                  onTap: () => Navigator.of(context).pushNamed('/live'),
                ),
                _hubTile(
                  context,
                  label: 'Workshops',
                  icon: Icons.palette_rounded,
                  colors: const [Color(0xFF8E2DE2), Color(0xFF4A00E0)],
                  onTap: () => Navigator.of(context).pushNamed('/workshops'),
                ),
                _hubTile(
                  context,
                  label: 'Webinars',
                  icon: Icons.co_present_rounded,
                  colors: const [Color(0xFF11998E), Color(0xFF38EF7D)],
                  onTap: () => Navigator.of(context).pushNamed('/webinars'),
                ),
                _hubTile(
                  context,
                  label: 'Offline Classes',
                  icon: Icons.location_city_rounded,
                  colors: const [Color(0xFF2193B0), Color(0xFF6DD5ED)],
                  onTap: () => Navigator.of(context).pushNamed('/offline'),
                ),
                _hubTile(
                  context,
                  label: 'Certifications',
                  icon: Icons.verified_rounded,
                  colors: const [Color(0xFFF7971E), Color(0xFFFFD200)],
                  onTap: () => Navigator.of(context).pushNamed('/certificates'),
                ),
                _hubTile(
                  context,
                  label: 'Assessments',
                  icon: Icons.assignment_rounded,
                  colors: const [Color(0xFF00B4DB), Color(0xFF0083B0)],
                  onTap: () => openRoute(context, 'tab:2'),
                ),
                _hubTile(
                  context,
                  label: 'Community',
                  icon: Icons.people_rounded,
                  colors: const [Color(0xFFDA22FF), Color(0xFF9733EE)],
                  onTap: () => openRoute(context, 'tab:3'),
                ),
              ],
            ),
            const SizedBox(height: 26),

            // Section Header: Popular Courses with Glittering Icon
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    GlitterIcon(
                      icon: Icons.local_fire_department_rounded,
                      size: 22,
                      color: QS.red,
                      glowColor: QS.amber,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Popular Courses',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: QS.ink,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => openRoute(context, 'tab:1'),
                  child: const Text(
                    'View all >',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: QS.teal,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Popular Courses Horizontal Carousel
            SizedBox(
              height: 210,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _popularCourseCard(
                    context,
                    title: 'Mind & Memory Mastery',
                    instructor: 'Dr. Arjun Mehta',
                    rating: 4.9,
                    students: '1.5k',
                    price: '₹999',
                    art: Art.bulb,
                    slug: 'mind-memory-mastery',
                  ),
                  const SizedBox(width: 14),
                  _popularCourseCard(
                    context,
                    title: 'Design Thinking for Young Minds',
                    instructor: 'Neha Kapoor',
                    rating: 4.8,
                    students: '890',
                    price: '₹1,499',
                    art: Art.palette,
                    slug: 'design-thinking-for-young-minds',
                  ),
                  const SizedBox(width: 14),
                  _popularCourseCard(
                    context,
                    title: 'Public Speaking & Confidence',
                    instructor: 'Kabir Sharma',
                    rating: 4.9,
                    students: '620',
                    price: '₹899',
                    art: Art.speech,
                    slug: 'public-speaking',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 26),

            // Section Header: Upcoming Live Sessions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    GlitterIcon(
                      icon: Icons.videocam_rounded,
                      size: 20,
                      color: QS.teal,
                      glowColor: QS.mint,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Upcoming Live Sessions',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: QS.ink,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => Navigator.of(context).pushNamed('/webinars'),
                  child: const Text(
                    'View all >',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: QS.teal,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Upcoming Session Card 1
            Container(
              padding: const EdgeInsets.all(16),
              decoration: embossedDecoration(
                fill: Colors.white,
                borderRadius: 20,
              ),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [fade(QS.teal, 0.15), fade(QS.teal, 0.05)],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: fade(QS.teal, 0.3)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Text(
                          '12',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: QS.deep,
                          ),
                        ),
                        Text(
                          'AUG',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: QS.teal,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: QS.red,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                '🔴 LIVE',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Power of Mindfulness in Daily Life',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w800,
                                  color: QS.ink,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          '10:00 AM - 11:30 AM • Dr. Meera Iyer',
                          style: TextStyle(fontSize: 12, color: QS.sub),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Free Entry',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: QS.teal,
                              ),
                            ),
                            GestureDetector(
                              onTap: () =>
                                  Navigator.of(context).pushNamed('/live'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 7),
                                decoration: BoxDecoration(
                                  gradient: QS.primaryGradient,
                                  borderRadius: BorderRadius.circular(18),
                                  boxShadow: [
                                    BoxShadow(
                                      color: fade(QS.deep, 0.25),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ],
                                ),
                                child: const Text(
                                  'Register',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                  ),
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
            const SizedBox(height: 26),

            // Section Header: Recommended for You
            Row(
              children: const [
                GlitterIcon(
                  icon: Icons.star_rounded,
                  size: 20,
                  color: QS.amber,
                  glowColor: QS.gold,
                ),
                SizedBox(width: 8),
                Text(
                  'Recommended for You',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: QS.ink,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Horizontal Cards
            SizedBox(
              height: 220,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _recCard(
                    context,
                    title: 'Mind & Memory Mastery',
                    instructor: 'Dr. Arjun Mehta',
                    rating: '4.8 (1.2k)',
                    price: '₹999',
                    art: Art.bulb,
                  ),
                  const SizedBox(width: 14),
                  _recCard(
                    context,
                    title: 'Creative Thinking Workshop',
                    instructor: 'Neha Kapoor',
                    rating: '4.7 (410)',
                    price: '₹499',
                    art: Art.palette,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _popularCourseCard(
    BuildContext context, {
    required String title,
    required String instructor,
    required double rating,
    required String students,
    required String price,
    required Art art,
    required String slug,
  }) {
    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed('/course', arguments: slug),
      child: Container(
        width: 230,
        padding: const EdgeInsets.all(12),
        decoration: embossedDecoration(
          fill: Colors.white,
          borderRadius: 20,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ArtThumb(art: art, height: 95, width: double.infinity, radius: 14),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      gradient: QS.goldGradient,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(color: fade(QS.gold, 0.4), blurRadius: 6),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        GlitterIcon(icon: Icons.workspace_premium_rounded, size: 12, color: QS.deep, glowColor: QS.gold),
                        SizedBox(width: 3),
                        Text(
                          'POPULAR',
                          style: TextStyle(color: QS.deep, fontSize: 9.5, fontWeight: FontWeight.w900),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '$instructor • $students learners',
              style: const TextStyle(fontSize: 11.5, color: QS.sub),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Stars(rating: rating),
                Text(
                  price,
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
    );
  }

  Widget _recCard(
    BuildContext context, {
    required String title,
    required String instructor,
    required String rating,
    required String price,
    required Art art,
  }) {
    return GestureDetector(
      onTap: () => Navigator.of(context).pushNamed(
        '/course',
        arguments: 'design-thinking-for-young-minds',
      ),
      child: Container(
        width: 220,
        padding: const EdgeInsets.all(12),
        decoration: embossedDecoration(
          fill: Colors.white,
          borderRadius: 20,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ArtThumb(art: art, height: 80, width: double.infinity, radius: 14),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              instructor,
              style: const TextStyle(fontSize: 11.5, color: QS.sub),
            ),
            const Spacer(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  price,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: QS.deep,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _hubTile(
    BuildContext context, {
    required String label,
    required IconData icon,
    required List<Color> colors,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: colors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: colors.last.withOpacity(0.32),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 24,
                  child: Container(
                    decoration: BoxDecoration(
                      color: fade(Colors.white, 0.22),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(18),
                      ),
                    ),
                  ),
                ),
                Icon(
                  icon,
                  color: Colors.white,
                  size: 26,
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: QS.ink,
            ),
          ),
        ],
      ),
    );
  }
}
