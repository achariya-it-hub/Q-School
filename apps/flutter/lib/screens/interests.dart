import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';

class InterestsScreen extends StatefulWidget {
  const InterestsScreen({super.key});

  @override
  State<InterestsScreen> createState() => _InterestsScreenState();
}

class _InterestsScreenState extends State<InterestsScreen> {
  final Set<int> _selectedIndices = {0, 1, 2}; // Academic, Life Skills, Mindfulness default

  final List<Map<String, dynamic>> _categories = const [
    {
      'title': 'Academic\nLearning',
      'icon': Icons.school_rounded,
      'bg': Color(0xFFEBF3FF),
      'color': Color(0xFF2563EB),
    },
    {
      'title': 'Life Skills',
      'icon': Icons.psychology_rounded,
      'bg': Color(0xFFFFF0E6),
      'color': Color(0xFFEA580C),
    },
    {
      'title': 'Mindfulness &\nMeditation',
      'icon': Icons.self_improvement_rounded,
      'bg': Color(0xFFF3E8FF),
      'color': Color(0xFF9333EA),
    },
    {
      'title': 'Communication',
      'icon': Icons.record_voice_over_rounded,
      'bg': Color(0xFFFFEBEE),
      'color': Color(0xFFE11D48),
    },
    {
      'title': 'Creativity',
      'icon': Icons.palette_rounded,
      'bg': Color(0xFFFFFDE7),
      'color': Color(0xFFD97706),
    },
    {
      'title': 'Personal\nDevelopment',
      'icon': Icons.trending_up_rounded,
      'bg': Color(0xFFE8F8F5),
      'color': Color(0xFF0D9488),
    },
    {
      'title': 'Wellness &\nHealth',
      'icon': Icons.favorite_rounded,
      'bg': Color(0xFFE0F7FA),
      'color': Color(0xFF0891B2),
    },
    {
      'title': 'Technology',
      'icon': Icons.devices_rounded,
      'bg': Color(0xFFEDE7F6),
      'color': Color(0xFF651FFF),
    },
    {
      'title': 'Career Growth',
      'icon': Icons.work_rounded,
      'bg': Color(0xFFF1F8E9),
      'color': Color(0xFF65A30D),
    },
  ];

  void _onContinue() {
    Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: QS.ink),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                children: [
                  // Q SCHOOL logo
                  const Center(
                    child: QSchoolLogo(size: 34, showTagline: false),
                  ),
                  const SizedBox(height: 20),

                  // Title & Description
                  const Text(
                    'Select Your Interests',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Choose your preferred subjects to personalize your learning experience',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13.5,
                      color: QS.sub,
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Grid of Category Tiles (3 Columns)
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 14,
                      childAspectRatio: 0.85,
                    ),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = _selectedIndices.contains(index);

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedIndices.remove(index);
                            } else {
                              _selectedIndices.add(index);
                            }
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? fade(QS.teal, 0.06)
                                : const Color(0xFFF8FAF9),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? QS.teal : QS.line,
                              width: isSelected ? 2 : 1,
                            ),
                          ),
                          child: Stack(
                            children: [
                              Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  // Circle Icon Box
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: cat['bg'],
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      cat['icon'],
                                      size: 24,
                                      color: cat['color'],
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    cat['title'],
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.w600,
                                      color: isSelected ? QS.deep : QS.ink,
                                      height: 1.2,
                                    ),
                                  ),
                                ],
                              ),
                              if (isSelected)
                                const Positioned(
                                  top: 0,
                                  right: 0,
                                  child: CircleAvatar(
                                    radius: 9,
                                    backgroundColor: QS.teal,
                                    child: Icon(
                                      Icons.check_rounded,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Bottom Continue Button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 20),
              child: QSButton(
                label: 'Continue',
                onTap: _onContinue,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
