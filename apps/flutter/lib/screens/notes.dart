import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class MyNotesScreen extends StatefulWidget {
  const MyNotesScreen({super.key});

  @override
  State<MyNotesScreen> createState() => _MyNotesScreenState();
}

class _MyNotesScreenState extends State<MyNotesScreen> {
  final List<Map<String, dynamic>> _notes = [
    {
      'title': 'Memory Palace Technique',
      'course': 'Mind & Memory Mastery',
      'lesson': 'Lesson 4 • 12:45',
      'date': 'Yesterday',
      'text': 'Associate key facts with familiar physical locations in your house. The stronger the visual sensory triggers, the longer the retention span.',
    },
    {
      'title': '5-Step Ideation Process',
      'course': 'Design Thinking for Young Minds',
      'lesson': 'Lesson 2 • 05:18',
      'date': 'Oct 02, 2026',
      'text': 'Empathize -> Define -> Ideate -> Prototype -> Test. Always iterate after getting raw user feedback.',
    },
    {
      'title': 'Diaphragmatic Breathing Drill',
      'course': 'Mindfulness & Meditation',
      'lesson': 'Lesson 1 • 18:20',
      'date': 'Sep 24, 2026',
      'text': '4-7-8 breathing method relaxes the autonomic nervous system before public speaking engagements.',
    },
  ];

  void _addNoteDialog() {
    final titleCtrl = TextEditingController();
    final textCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Add Quick Study Note',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: QS.ink),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: titleCtrl,
              decoration: InputDecoration(
                hintText: 'Note Title',
                filled: true,
                fillColor: const Color(0xFFF2F7F5),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: textCtrl,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Type your lecture summary or key takeaways...',
                filled: true,
                fillColor: const Color(0xFFF2F7F5),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            QSButton(
              label: 'Save Note',
              onTap: () {
                if (titleCtrl.text.isNotEmpty && textCtrl.text.isNotEmpty) {
                  setState(() {
                    _notes.insert(0, {
                      'title': titleCtrl.text,
                      'course': 'General Notes',
                      'lesson': 'Personal Summary',
                      'date': 'Just now',
                      'text': textCtrl.text,
                    });
                  });
                  Navigator.pop(ctx);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNoteDialog,
        backgroundColor: QS.deep,
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
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
                    'My Lecture Notes',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: embossedDecoration(fill: Colors.white, borderRadius: 12),
                    child: Text(
                      '${_notes.length} Notes',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: QS.deep),
                    ),
                  ),
                ],
              ),
            ),

            // Notes Stream List
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
                itemCount: _notes.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final note = _notes[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: embossedDecoration(fill: Colors.white, borderRadius: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: fade(QS.teal, 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.note_alt_rounded, size: 18, color: QS.teal),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    note['title'],
                                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: QS.ink),
                                  ),
                                  Text(
                                    '${note['course']} • ${note['lesson']}',
                                    style: const TextStyle(fontSize: 11, color: QS.sub),
                                  ),
                                ],
                              ),
                            ),
                            Text(note['date'], style: const TextStyle(fontSize: 11, color: QS.sub)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF7FAF9),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: QS.line),
                          ),
                          child: Text(
                            note['text'],
                            style: const TextStyle(fontSize: 13, color: QS.body, height: 1.4),
                          ),
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
