import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class OfflineScreen extends StatefulWidget {
  const OfflineScreen({super.key});
  @override
  State<OfflineScreen> createState() => _OfflineScreenState();
}

class _OfflineScreenState extends State<OfflineScreen> {
  int _tab = 0;
  String? _open;

  @override
  Widget build(BuildContext context) {
    return QSPage(
      title: 'Offline Classes',
      back: true,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      children: [
        Segments(items: const ['Nearby', 'All Locations'], value: _tab, onChanged: (i) => setState(() => _tab = i)),
        for (final c in centers)
          ListRow(
            onTap: () => setState(() => _open = _open == c.name ? null : c.name),
            leading: const ArtThumb(art: Art.building, width: 104, height: 98, iconSize: 38),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RowTitle(
                  c.name,
                  trailing: Icon(
                    _open == c.name ? Icons.expand_more_rounded : Icons.chevron_right_rounded,
                    color: QS.ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text('${c.area}, ${c.city}', style: rowSub),
                const SizedBox(height: 8),
                const Wrap(spacing: 6, children: [_Batch('Regular Classes'), _Batch('Weekend Batches')]),
                if (_open == c.name)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      'Mon–Fri 4–7 PM • Sat–Sun 9 AM–1 PM\nLabs: Robotics, Art studio, Library',
                      style: TextStyle(fontSize: 12, color: QS.sub, height: 1.5),
                    ),
                  ),
                PillButton(
                  label: 'View Details',
                  onTap: () => setState(() => _open = _open == c.name ? null : c.name),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Batch extends StatelessWidget {
  const _Batch(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: const Color(0xFFF1F5F4), borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: const TextStyle(fontSize: 10.5, color: QS.body)),
    );
  }
}
