import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});
  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final inProgress = enrollments.where((e) => !e.completed).toList();
    return QSPage(
      title: 'Certificates',
      back: true,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      children: [
        Segments(
          items: ['Earned (${certificates.length})', 'In Progress'],
          value: _tab,
          onChanged: (i) => setState(() => _tab = i),
        ),
        if (_tab == 0)
          for (var i = 0; i < certificates.length; i++)
            ListRow(
              leading: const _CertThumb(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RowTitle(
                    certificates[i].title,
                    trailing: Icon(i == 0 ? Icons.bookmark_border_rounded : Icons.more_vert_rounded,
                        size: 19, color: QS.ink),
                  ),
                  const SizedBox(height: 2),
                  Text('Completed on ${certificates[i].completed}', style: rowSub),
                  PillButton(
                    label: 'View Certificate',
                    outline: true,
                    onTap: () => _preview(context, certificates[i]),
                  ),
                ],
              ),
            )
        else
          for (final e in inProgress)
            ListRow(
              leading: const Opacity(opacity: 0.55, child: _CertThumb()),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  RowTitle(e.title),
                  const SizedBox(height: 10),
                  ProgressRow(value: e.pct),
                  const SizedBox(height: 4),
                  Text('${e.total - e.done} lessons to unlock', style: rowSub),
                ],
              ),
            ),
      ],
    );
  }

  void _preview(BuildContext context, Certificate c) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.workspace_premium_rounded, size: 56, color: Color(0xFFC9861A)),
            const SizedBox(height: 10),
            const Text('Certificate of Completion', style: TextStyle(color: QS.sub, fontSize: 13)),
            const SizedBox(height: 6),
            Text(c.title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: QS.ink)),
            const SizedBox(height: 4),
            Text('Awarded to ${Student.name} • ${c.completed}', style: const TextStyle(color: QS.body, fontSize: 13)),
            const SizedBox(height: 20),
            QSButton(label: 'Share Certificate', icon: Icons.share_outlined, onTap: () => Navigator.of(context).pop()),
          ],
        ),
      ),
    );
  }
}

class _CertThumb extends StatelessWidget {
  const _CertThumb();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 92,
      height: 100,
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFFF4D6), Color(0xFFF8DFA0)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: const Color(0xFFD9A441), width: 1.5),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.workspace_premium_rounded, size: 30, color: Color(0xFFC9861A)),
            const SizedBox(height: 5),
            Container(width: 40, height: 3, decoration: _line),
            const SizedBox(height: 5),
            Container(width: 26, height: 3, decoration: _line),
          ],
        ),
      ),
    );
  }

  static final _line = BoxDecoration(color: const Color(0xFFE2B964), borderRadius: BorderRadius.circular(2));
}
