import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';

class TeacherDashboardScreen extends StatelessWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
          children: [
            // Top App Bar
            Row(
              children: [
                const QSchoolLogo(size: 32, showTagline: false),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: fade(QS.teal, 0.12),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: fade(QS.teal, 0.3)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.school_rounded, size: 14, color: QS.teal),
                      SizedBox(width: 4),
                      Text(
                        'TEACHER',
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w900,
                          color: QS.deep,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                const Avatar(name: 'Prof Alex', size: 38),
              ],
            ),
            const SizedBox(height: 20),

            // Greeting Banner
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Teacher Portal',
                  style: TextStyle(
                    fontSize: 13,
                    color: QS.sub,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Welcome Back, Prof. Alex 🎓',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: QS.ink,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Teacher Quick Stats Grid (4 Cards)
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.6,
              children: const [
                _TeacherStatCard('4', 'Active Classes', Icons.cast_for_education_rounded, QS.teal),
                _TeacherStatCard('280', 'Total Students', Icons.groups_rounded, QS.deep),
                _TeacherStatCard('4.9 ⭐', 'Instructor Rating', Icons.star_rounded, QS.amber),
                _TeacherStatCard('₹42,500', 'Monthly Earnings', Icons.account_balance_wallet_rounded, Color(0xFF00C853)),
              ],
            ),
            const SizedBox(height: 24),

            // Quick Action Buttons Row
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pushNamed('/live'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [QS.red, Color(0xFFFF6B6B)],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: fade(QS.red, 0.35),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.videocam_rounded, color: Colors.white, size: 20),
                          SizedBox(width: 8),
                          Text(
                            '🔴 Go Live Now',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 13.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      gradient: QS.primaryGradient,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: fade(QS.deep, 0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.add_circle_outline_rounded, color: Colors.white, size: 20),
                        SizedBox(width: 6),
                        Text(
                          '+ New Course',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 13.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 26),

            // Upcoming Teaching Sessions Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'Upcoming Teaching Sessions',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: QS.ink,
                  ),
                ),
                Text(
                  'Schedule >',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: QS.teal,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Teaching Session Card 1
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: QS.line, width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.deep, 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: fade(QS.teal, 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'TODAY • 4:00 PM',
                          style: TextStyle(
                            color: QS.deep,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        '48 Enrolled',
                        style: TextStyle(fontSize: 12, color: QS.sub, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Mind & Memory Mastery (Batch A)',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Topic: Scientific Memory Techniques & Practical Drills',
                    style: TextStyle(fontSize: 12, color: QS.sub),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.of(context).pushNamed('/live'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [QS.red, Color(0xFFFF6B6B)],
                            ),
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: fade(QS.red, 0.3),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: const Text(
                            'Start Class',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12.5,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Teaching Session Card 2
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: QS.line, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F4),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'TOMORROW • 10:00 AM',
                          style: TextStyle(
                            color: QS.sub,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const Spacer(),
                      const Text(
                        '35 Enrolled',
                        style: TextStyle(fontSize: 12, color: QS.sub, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    'Advanced Creative Thinking Workshop',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Topic: Ideation Frameworks & Group Activity',
                    style: TextStyle(fontSize: 12, color: QS.sub),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 26),

            // Section: Pending Assignments to Grade
            const Text(
              'Student Assignments to Grade',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 12),
            _assignmentItem('Design Prototype Submission', '12 Submissions pending', 'Grade Now'),
            _assignmentItem('Mindfulness Reflection Journal', '5 Submissions pending', 'Review'),
          ],
        ),
      ),
    );
  }

  Widget _assignmentItem(String title, String sub, String btnText) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: QS.line),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: fade(QS.teal, 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.assignment_turned_in_rounded, size: 20, color: QS.teal),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: QS.ink),
                ),
                Text(
                  sub,
                  style: const TextStyle(fontSize: 11.5, color: QS.sub),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: QS.deep,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              btnText,
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}

class _TeacherStatCard extends StatelessWidget {
  const _TeacherStatCard(this.value, this.label, this.icon, this.color);
  final String value;
  final String label;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: embossedDecoration(
        fill: Colors.white,
        borderRadius: 18,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  color: color == QS.amber ? QS.ink : color,
                ),
              ),
              Icon(icon, size: 22, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: QS.sub, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
