import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class LiveClassScreen extends StatefulWidget {
  const LiveClassScreen({super.key});

  @override
  State<LiveClassScreen> createState() => _LiveClassScreenState();
}

class _LiveClassScreenState extends State<LiveClassScreen> {
  int _selectedTab = 0;
  final List<String> _tabs = const ['Chat', 'Notes', 'Q&A', 'Resources'];

  final TextEditingController _msgController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'who': 'Riya',
      'time': '10:12 AM',
      'text': 'This is very helpful! 🙏',
      'isInstructor': false,
    },
    {
      'who': 'Amit',
      'time': '10:14 AM',
      'text': 'Can you share the notes?',
      'isInstructor': false,
    },
    {
      'who': 'Dr. Arjun Mehta',
      'time': '10:14 AM',
      'text': 'I\'ll share them in the resources section shortly.',
      'isInstructor': true,
    },
    {
      'who': 'Sneha',
      'time': '10:15 AM',
      'text': 'Amazing session!',
      'isInstructor': false,
    },
  ];

  void _send() {
    if (_msgController.text.trim().isNotEmpty) {
      setState(() {
        _messages.add({
          'who': 'Alex Johnson',
          'time': 'Just now',
          'text': _msgController.text.trim(),
          'isInstructor': false,
        });
        _msgController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Video Player Container
            Container(
              height: 230,
              width: double.infinity,
              color: Colors.black,
              child: Stack(
                children: [
                  // Video stream mock graphic
                  Positioned.fill(
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF0F2027), Color(0xFF203A43)],
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.person_pin_rounded,
                          size: 90,
                          color: Colors.white54,
                        ),
                      ),
                    ),
                  ),

                  // Header Bar Over Video
                  Positioned(
                    top: 12,
                    left: 12,
                    right: 12,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_rounded,
                              color: Colors.white),
                          onPressed: () => Navigator.of(context).maybePop(),
                        ),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: QS.red,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                '🔴 LIVE',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: fade(Colors.black, 0.5),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                children: const [
                                  Icon(Icons.remove_red_eye_rounded,
                                      size: 14, color: Colors.white),
                                  SizedBox(width: 4),
                                  Text(
                                    '1.2K',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Bottom Controls Bar
                  Positioned(
                    bottom: 8,
                    left: 14,
                    right: 14,
                    child: Row(
                      children: [
                        const Icon(Icons.pause_rounded,
                            color: Colors.white, size: 24),
                        const SizedBox(width: 10),
                        const Text(
                          '10:24 / 45:00',
                          style: TextStyle(color: Colors.white, fontSize: 11),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white54),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            '1.0x',
                            style:
                                TextStyle(color: Colors.white, fontSize: 10),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.fullscreen_rounded,
                            color: Colors.white, size: 22),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Tab Bar (Chat / Notes / Q&A / Resources)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: UnderlineTabs(
                items: _tabs,
                value: _selectedTab,
                onChanged: (i) => setState(() => _selectedTab = i),
              ),
            ),
            const Divider(height: 1, color: QS.line),

            // Chat Messages Stream
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final msg = _messages[index];
                  final isInstructor = msg['isInstructor'] == true;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 16,
                          backgroundColor:
                              isInstructor ? QS.teal : const Color(0xFFE2ECE9),
                          child: Text(
                            msg['who'][0],
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isInstructor ? Colors.white : QS.deep,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    msg['who'],
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.w700,
                                      color: isInstructor ? QS.teal : QS.ink,
                                    ),
                                  ),
                                  if (isInstructor) ...[
                                    const SizedBox(width: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: QS.teal,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text(
                                        'Instructor',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ],
                                  const SizedBox(width: 6),
                                  Text(
                                    msg['time'],
                                    style: const TextStyle(
                                        fontSize: 10.5, color: QS.sub),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                msg['text'],
                                style: const TextStyle(
                                    fontSize: 13, color: QS.ink),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Message Input Bar
            Container(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              decoration: const BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: QS.line)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      height: 46,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: QS.field,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: QS.line),
                      ),
                      child: TextField(
                        controller: _msgController,
                        onSubmitted: (_) => _send(),
                        style: const TextStyle(fontSize: 13.5, color: QS.ink),
                        decoration: const InputDecoration(
                          hintText: 'Type a message...',
                          hintStyle: TextStyle(color: Color(0xFF94A6A1)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _send,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: QS.deep,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 20,
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
}
