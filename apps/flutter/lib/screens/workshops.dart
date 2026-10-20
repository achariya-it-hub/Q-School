import 'package:flutter/material.dart';

import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class WorkshopsScreen extends StatefulWidget {
  const WorkshopsScreen({super.key});
  @override
  State<WorkshopsScreen> createState() => _WorkshopsScreenState();
}

class _WorkshopsScreenState extends State<WorkshopsScreen> {
  int _tab = 0;
  final Set<String> _booked = {};

  @override
  Widget build(BuildContext context) {
    final list = _tab == 2 ? workshops : workshops.where((w) => _tab == 1 ? w.past : !w.past).toList();
    return QSPage(
      title: 'Workshops',
      back: true,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
      children: [
        Segments(items: const ['Upcoming', 'Past', 'All Categories'], value: _tab, onChanged: (i) => setState(() => _tab = i)),
        for (final w in list)
          ListRow(
            leading: ArtThumb(art: w.art, width: 104, height: 96),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RowTitle(w.title, trailing: const Icon(Icons.more_vert_rounded, size: 18, color: QS.ink)),
                Meta(icon: Icons.schedule_rounded, text: '${w.days} • ${w.mode}'),
                if (w.city != null) Meta(icon: Icons.location_on_outlined, text: w.city!),
                Meta(icon: Icons.calendar_today_outlined, text: w.date),
                if (w.seatsLeft != null)
                  Meta(icon: Icons.people_outline_rounded, text: '${w.seatsLeft} Seats Left', color: QS.red),
                if (!w.past)
                  PillButton(
                    label: _booked.contains(w.id) ? 'Registered ✓' : 'Register',
                    outline: _booked.contains(w.id),
                    onTap: () => setState(() => _booked.contains(w.id) ? _booked.remove(w.id) : _booked.add(w.id)),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}
