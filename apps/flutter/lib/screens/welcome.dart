import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late AnimationController _animController;

  final List<Map<String, dynamic>> _onboardingData = [
    {
      'isSplash': true,
      'title': 'Skills for a\nBrighter Tomorrow',
    },
    {
      'isSplash': false,
      'title': 'Learn Beyond\nthe Classroom',
      'desc':
          'Live classes, expert webinars, video courses and more to help you grow.',
      'icon': Icons.school_rounded,
      'image': 'assets/images/onboarding1.png',
    },
    {
      'isSplash': false,
      'title': 'Interactive\nLive Classes',
      'desc': 'Learn from expert mentors around the world.',
      'icon': Icons.live_tv_rounded,
      'badge': 'LIVE',
      'image': 'assets/images/onboarding2.png',
    },
    {
      'isSplash': false,
      'title': 'Learn Anytime\nAnywhere',
      'desc':
          'Access recorded classes, download for offline learning and learn at your own pace.',
      'icon': Icons.play_circle_fill_rounded,
    },
    {
      'isSplash': false,
      'title': 'Grow Your Skills\nAchieve Your Goals',
      'desc':
          'From academic learning to life skills, explore programs designed for a brighter you.',
      'icon': Icons.workspace_premium_rounded,
      'isFinal': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _onboardingData.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    } else {
      Navigator.of(context).pushNamed('/login');
    }
  }

  void _skip() {
    Navigator.of(context).pushNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    final currentItem = _onboardingData[_currentPage];
    final bool isSplash = currentItem['isSplash'] == true;

    return Scaffold(
      backgroundColor: isSplash ? const Color(0xFF011713) : const Color(0xFFF7FAF9),
      body: Stack(
        children: [
          // Main PageView containing all slides (Splash + Onboarding)
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: _onboardingData.length,
            itemBuilder: (context, index) {
              final data = _onboardingData[index];
              if (data['isSplash'] == true) {
                return _buildSplashSlide(data);
              }
              return _buildOnboardingSlide(data);
            },
          ),

          // Top Header Bar (Only visible on Onboarding slides, hidden on Splash)
          if (!isSplash)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const QSchoolLogo(size: 32, showTagline: false),
                      if (currentItem['isFinal'] != true)
                        GestureDetector(
                          onTap: _skip,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: fade(QS.teal, 0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text(
                              'Skip',
                              style: TextStyle(
                                color: QS.deep,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

          // Bottom Action Area (Explore Q-School / Onboarding Nav)
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(28, 12, 28, 24),
                child: isSplash
                    ? QSButton(
                        label: 'Explore Q-School',
                        onTap: _nextPage,
                      )
                    : (currentItem['isFinal'] == true
                        ? QSButton(
                            label: 'Get Started',
                            onTap: () => Navigator.of(context).pushNamed('/login'),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Glowing Dots
                              Row(
                                children: List.generate(
                                  _onboardingData.length - 1,
                                  (i) {
                                    final active = (_currentPage - 1) == i;
                                    return AnimatedContainer(
                                      duration: const Duration(milliseconds: 250),
                                      margin: const EdgeInsets.only(right: 8),
                                      width: active ? 24 : 8,
                                      height: 8,
                                      decoration: BoxDecoration(
                                        gradient: active ? QS.heroGradient : null,
                                        color: active
                                            ? null
                                            : fade(QS.sub, 0.25),
                                        borderRadius: BorderRadius.circular(4),
                                        boxShadow: active
                                            ? [
                                                BoxShadow(
                                                  color: fade(QS.teal, 0.4),
                                                  blurRadius: 8,
                                                ),
                                              ]
                                            : null,
                                      ),
                                    );
                                  },
                                ),
                              ),
                              // Glossy Circular Arrow Button
                              GestureDetector(
                                onTap: _nextPage,
                                child: Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    gradient: QS.primaryGradient,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: fade(Colors.white, 0.3), width: 1.5),
                                    boxShadow: [
                                      BoxShadow(
                                        color: fade(QS.deep, 0.35),
                                        blurRadius: 14,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(
                                    Icons.arrow_forward_rounded,
                                    color: Colors.white,
                                    size: 24,
                                  ),
                                ),
                              ),
                            ],
                          )),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSplashSlide(Map<String, dynamic> data) {
    return SizedBox.expand(
      child: Image.asset(
        'assets/images/splash_exact.jpg',
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
      ),
    );
  }

  Widget _buildOnboardingSlide(Map<String, dynamic> data) {
    final IconData icon = data['icon'];
    final String? badge = data['badge'];
    final String? image = data['image'];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),

          // Glassmorphic Arch Visual Frame with Real Image
          Container(
            width: 280,
            height: 270,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFFFFFFF), Color(0xFFE8F5F2)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(140),
                bottom: Radius.circular(36),
              ),
              border: Border.all(color: fade(QS.teal, 0.3), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: fade(QS.deep, 0.08),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(140),
                bottom: Radius.circular(36),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (image != null)
                    Positioned.fill(
                      child: Image.asset(
                        image,
                        fit: BoxFit.cover,
                      ),
                    )
                  else ...[
                    Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [fade(QS.mint, 0.35), fade(QS.mint, 0)],
                        ),
                      ),
                    ),
                    Icon(
                      icon,
                      size: 96,
                      color: QS.deep,
                    ),
                  ],
                  if (badge != null)
                    Positioned(
                      bottom: 20,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [QS.red, Color(0xFFFF6B6B)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: fade(QS.red, 0.4),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Text(
                          badge,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 11.5,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 38),

          Text(
            data['title'],
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 27,
              fontWeight: FontWeight.w900,
              color: QS.ink,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 14),

          Text(
            data['desc'],
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14.5,
              color: QS.sub,
              height: 1.45,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }
}
