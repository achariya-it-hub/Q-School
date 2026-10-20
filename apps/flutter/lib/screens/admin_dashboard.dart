import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/kit.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

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
                    color: fade(QS.gold, 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: QS.gold),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.shield_rounded, size: 14, color: QS.deep),
                      SizedBox(width: 4),
                      Text(
                        'SUPER ADMIN',
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
                const Avatar(name: 'Admin User', size: 38),
              ],
            ),
            const SizedBox(height: 20),

            // Greeting Banner
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'LMS Management Console',
                  style: TextStyle(
                    fontSize: 13,
                    color: QS.sub,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Platform Analytics 🛡️',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: QS.ink,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Platform Stats Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.6,
              children: const [
                _AdminStatCard('12,450', 'Total Learners', Icons.people_alt_rounded, QS.teal),
                _AdminStatCard('185', 'Published Courses', Icons.menu_book_rounded, QS.deep),
                _AdminStatCard('₹8.4 Lakh', 'Total Revenue', Icons.payments_rounded, Color(0xFF00C853)),
                _AdminStatCard('99.9%', 'System Health', Icons.bolt_rounded, QS.cyan),
              ],
            ),
            const SizedBox(height: 24),

            // Quick Admin Actions
            const Text(
              'Quick Administrative Actions',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: QS.ink,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _adminActionBtn(context, Icons.person_add_rounded, 'Add User', QS.teal),
                const SizedBox(width: 10),
                _adminActionBtn(context, Icons.category_rounded, 'Categories', QS.deep),
                const SizedBox(width: 10),
                _adminActionBtn(context, Icons.discount_rounded, 'Discounts', QS.gold),
              ],
            ),
            const SizedBox(height: 26),

            // Pending Approvals Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'Pending Approval Queue (3)',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: QS.ink,
                  ),
                ),
                Text(
                  'View all >',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: QS.teal,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Approval Item 1
            _approvalCard(
              context,
              title: 'Teacher Verification: Dr. Vikram Seth',
              sub: 'Subject: Data Science & ML • Applied 2h ago',
              type: 'Teacher Application',
            ),
            const SizedBox(height: 12),

            // Approval Item 2
            _approvalCard(
              context,
              title: 'New Course: Quantum Computing Basics',
              sub: 'By Dr. Arjun Rao • 14 Video Lessons • Pricing: ₹1,299',
              type: 'Course Submission',
            ),
            const SizedBox(height: 26),

            // Recent System Discounts & Financial Config
            Container(
              padding: const EdgeInsets.all(18),
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
                    children: const [
                      Icon(Icons.sell_rounded, color: QS.gold, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Active Billing Discounts',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: QS.ink,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _discountRow('FESTIVE33', '33% Off on all courses', '1,240 redeemed'),
                  _discountRow('EARLYBIRD', 'Flat ₹500 Off on Live Webinars', '850 redeemed'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _adminActionBtn(BuildContext context, IconData icon, String label, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: QS.line, width: 1.2),
          boxShadow: [
            BoxShadow(
              color: fade(QS.deep, 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, size: 22, color: color == QS.gold ? QS.ink : color),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: QS.ink),
            ),
          ],
        ),
      ),
    );
  }

  Widget _approvalCard(BuildContext context, {required String title, required String sub, required String type}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: QS.line, width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: fade(QS.teal, 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              type.toUpperCase(),
              style: const TextStyle(
                color: QS.teal,
                fontSize: 10,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: QS.ink),
          ),
          const SizedBox(height: 4),
          Text(sub, style: const TextStyle(fontSize: 12, color: QS.sub)),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: () {},
                style: OutlinedButton.styleFrom(
                  foregroundColor: QS.sub,
                  side: const BorderSide(color: QS.line),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                child: const Text('Reject', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: QS.deep,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                ),
                child: const Text('Approve', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _discountRow(String code, String desc, String stats) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(code, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: QS.deep)),
              Text(desc, style: const TextStyle(fontSize: 11.5, color: QS.sub)),
            ],
          ),
          Text(stats, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: QS.teal)),
        ],
      ),
    );
  }
}

class _AdminStatCard extends StatelessWidget {
  const _AdminStatCard(this.value, this.label, this.icon, this.color);
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
                  fontSize: 19,
                  fontWeight: FontWeight.w900,
                  color: QS.ink,
                ),
              ),
              Icon(icon, size: 22, color: color),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 11.5, color: QS.sub, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
