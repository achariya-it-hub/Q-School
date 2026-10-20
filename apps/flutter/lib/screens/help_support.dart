import 'package:flutter/material.dart';
import '../theme.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  final List<Map<String, String>> _faqs = const [
    {
      'q': 'How do I download certificates?',
      'a': 'Go to Profile -> My Certificates. You can view, verify, and download your high-resolution PDF certificates instantly.',
    },
    {
      'q': 'Can I access live session recordings?',
      'a': 'Yes, recorded webinars and live classes are automatically published in your Learn tab under Recorded Sessions within 2 hours.',
    },
    {
      'q': 'How do I request a refund?',
      'a': 'We offer a 7-day money-back guarantee for all self-paced courses. Navigate to My Orders and tap Request Refund on eligible orders.',
    },
    {
      'q': 'Who is Q-Master and how does it help?',
      'a': 'Q-Master is your AI Learning Assistant. You can ask Q-Master to explain complex course concepts, quiz you on topics, or generate study summaries.',
    },
  ];

  int? _openFaq;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Header
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
                    'Help & Support',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                children: [
                  // Support Banner Card
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: QS.primaryGradient,
                      borderRadius: BorderRadius.circular(22),
                      boxShadow: [
                        BoxShadow(
                          color: fade(QS.deep, 0.3),
                          blurRadius: 14,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: fade(Colors.white, 0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.headset_mic_rounded, color: Colors.white, size: 24),
                            ),
                            const SizedBox(width: 12),
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '24/7 Student Support',
                                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Colors.white),
                                ),
                                Text(
                                  'We\'re here to help you succeed',
                                  style: TextStyle(fontSize: 12, color: Colors.white70),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 18),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => Navigator.of(context).pushNamed('/ai_assistant'),
                                icon: const Icon(Icons.auto_awesome_rounded, size: 16),
                                label: const Text('Ask Q-Master', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: QS.gold,
                                  foregroundColor: QS.deep,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {},
                                icon: const Icon(Icons.email_outlined, size: 16),
                                label: const Text('Email Support', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Colors.white),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 26),

                  // FAQ Title
                  const Text(
                    'Frequently Asked Questions',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Accordions
                  for (var i = 0; i < _faqs.length; i++) ...[
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _openFaq = _openFaq == i ? null : i;
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: embossedDecoration(
                          fill: Colors.white,
                          borderRadius: 18,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    _faqs[i]['q']!,
                                    style: const TextStyle(
                                      fontSize: 14.5,
                                      fontWeight: FontWeight.w800,
                                      color: QS.ink,
                                    ),
                                  ),
                                ),
                                Icon(
                                  _openFaq == i ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                  color: QS.teal,
                                ),
                              ],
                            ),
                            if (_openFaq == i) ...[
                              const SizedBox(height: 10),
                              const Divider(height: 1, color: QS.line),
                              const SizedBox(height: 10),
                              Text(
                                _faqs[i]['a']!,
                                style: const TextStyle(fontSize: 13, color: QS.body, height: 1.45),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
