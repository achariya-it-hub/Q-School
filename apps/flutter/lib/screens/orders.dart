import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class MyOrdersScreen extends StatelessWidget {
  MyOrdersScreen({super.key});

  final List<Map<String, dynamic>> _orders = [
    {
      'id': 'ORD-98421',
      'title': 'Mind & Memory Mastery',
      'date': 'Oct 04, 2026',
      'amount': '₹999',
      'status': 'Completed',
      'statusColor': Color(0xFF00C853),
      'paymentMethod': 'UPI (GPay)',
      'art': Art.bulb,
    },
    {
      'id': 'ORD-87120',
      'title': 'Design Thinking for Young Minds',
      'date': 'Sep 28, 2026',
      'amount': '₹1,499',
      'status': 'Completed',
      'statusColor': Color(0xFF00C853),
      'paymentMethod': 'Credit Card',
      'art': Art.palette,
    },
    {
      'id': 'ORD-65419',
      'title': 'Mindfulness & Meditation Workshop',
      'date': 'Sep 15, 2026',
      'amount': '₹499',
      'status': 'Completed',
      'statusColor': Color(0xFF00C853),
      'paymentMethod': 'Net Banking',
      'art': Art.heart,
    },
    {
      'id': 'ORD-43210',
      'title': 'Python Programming Fundamentals',
      'date': 'Aug 10, 2026',
      'amount': '₹1,299',
      'status': 'Refunded',
      'statusColor': QS.sub,
      'paymentMethod': 'UPI (PhonePe)',
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
                    'My Orders',
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
                    child: Row(
                      children: const [
                        Icon(Icons.receipt_long_rounded, size: 14, color: QS.teal),
                        SizedBox(width: 4),
                        Text(
                          '4 Purchases',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: QS.deep),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Order History List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                itemCount: _orders.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final item = _orders[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: embossedDecoration(
                      fill: Colors.white,
                      borderRadius: 20,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              item['id'],
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: QS.sub,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: fade(item['statusColor'], 0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item['status'],
                                style: TextStyle(
                                  color: item['statusColor'],
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ArtThumb(art: item['art'], width: 56, height: 56, radius: 14),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['title'],
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: QS.ink,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${item['date']} • ${item['paymentMethod']}',
                                    style: const TextStyle(fontSize: 11.5, color: QS.sub),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        const Divider(height: 1, color: QS.line),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Text('Total Paid: ', style: TextStyle(fontSize: 12, color: QS.sub)),
                                Text(
                                  item['amount'],
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: QS.deep,
                                  ),
                                ),
                              ],
                            ),
                            OutlinedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.download_rounded, size: 14, color: QS.teal),
                              label: const Text('Invoice', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800)),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: QS.teal,
                                side: const BorderSide(color: QS.teal),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              ),
                            ),
                          ],
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
