import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class WebinarsScreen extends StatefulWidget {
  const WebinarsScreen({super.key});
  @override
  State<WebinarsScreen> createState() => _WebinarsScreenState();
}

class _WebinarsScreenState extends State<WebinarsScreen> {
  int _tab = 0;
  final Set<String> _booked = {};

  @override
  Widget build(BuildContext context) {
    final list = _tab == 2 ? webinars : webinars.where((w) => _tab == 1 ? w.recorded : !w.recorded).toList();
    return QSPage(
      title: 'Webinars',
      back: true,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      children: [
        Segments(items: const ['Upcoming', 'Recorded', 'All Topics'], value: _tab, onChanged: (i) => setState(() => _tab = i)),
        for (final w in list)
          ListRow(
            leading: ArtThumb(
              art: w.art,
              width: 104,
              height: 96,
              child: w.recorded
                  ? Center(
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(color: fade(Colors.white, 0.9), shape: BoxShape.circle),
                        child: const Icon(Icons.play_arrow_rounded, color: QS.deep, size: 22),
                      ),
                    )
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RowTitle(w.title, trailing: const Icon(Icons.more_vert_rounded, size: 18, color: QS.ink)),
                const SizedBox(height: 2),
                Text('By ${w.by}', style: rowSub),
                Meta(icon: Icons.calendar_today_outlined, text: '${w.date} • ${w.duration}'),
                Meta(icon: Icons.people_outline_rounded, text: '${w.registered} ${w.recorded ? 'Views' : 'Registered'}'),
                PillButton(
                  label: w.recorded ? 'Watch' : (_booked.contains(w.id) ? 'Registered ✓' : 'Register'),
                  outline: _booked.contains(w.id),
                  onTap: () {
                    if (w.recorded) return;
                    setState(() => _booked.contains(w.id) ? _booked.remove(w.id) : _booked.add(w.id));
                  },
                ),
              ],
            ),
          ),
      ],
    );
  }
}
