import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';

/* ────────── Glittering Animated Icon Widget ────────── */

class GlitterIcon extends StatefulWidget {
  const GlitterIcon({
    super.key,
    required this.icon,
    this.size = 24.0,
    this.color = QS.gold,
    this.glowColor = QS.mint,
  });

  final IconData icon;
  final double size;
  final Color color;
  final Color glowColor;

  @override
  State<GlitterIcon> createState() => _GlitterIconState();
}

class _GlitterIconState extends State<GlitterIcon> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final progress = _controller.value;
        return Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            // Glittering halo glow
            Container(
              width: widget.size * 1.5,
              height: widget.size * 1.5,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    fade(widget.glowColor, 0.45 * progress),
                    fade(widget.glowColor, 0.0),
                  ],
                ),
              ),
            ),
            // Sparkling star particles
            Positioned(
              top: -widget.size * 0.15 * progress,
              right: -widget.size * 0.15 * progress,
              child: Opacity(
                opacity: (0.4 + 0.6 * progress).clamp(0.0, 1.0),
                child: Icon(
                  Icons.auto_awesome_rounded,
                  size: widget.size * 0.45,
                  color: widget.color,
                ),
              ),
            ),
            // Main Icon with Specular Glitter Shadow
            Icon(
              widget.icon,
              size: widget.size,
              color: widget.color,
              shadows: [
                Shadow(
                  color: fade(widget.glowColor, 0.8 * progress + 0.2),
                  blurRadius: 12 + 10 * progress,
                ),
                Shadow(
                  color: fade(Colors.white, 0.9 * progress),
                  blurRadius: 4,
                  offset: const Offset(0, -1),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}

/* ────────── Glossy Illustrated Thumbnail ────────── */

class ArtThumb extends StatelessWidget {
  const ArtThumb({
    super.key,
    required this.art,
    this.width,
    this.height,
    this.iconSize = 36,
    this.radius = 16,
    this.child,
  });

  final Art art;
  final double? width;
  final double? height;
  final double iconSize;
  final double radius;
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final a = artStyles[art]!;
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [a.from, a.to],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: fade(a.accent, 0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: iconSize * 2.4,
              height: iconSize * 2.4,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [fade(a.accent, 0.4), fade(a.accent, 0)],
                ),
              ),
            ),
            Positioned(
              right: -iconSize * 0.4,
              top: -iconSize * 0.4,
              child: Container(
                width: iconSize * 1.8,
                height: iconSize * 1.8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: fade(Colors.white, 0.2), width: 1.5),
                ),
              ),
            ),
            Icon(
              a.icon,
              size: iconSize,
              color: Colors.white,
              shadows: [
                Shadow(color: fade(a.accent, 0.8), blurRadius: 16),
              ],
            ),
            if (child != null) Positioned.fill(child: child!),
          ],
        ),
      ),
    );
  }
}

class Avatar extends StatelessWidget {
  const Avatar({super.key, required this.name, this.size = 40, this.ring = true});
  final String name;
  final double size;
  final bool ring;

  String get initials {
    final parts = name.split(' ').where((w) => w.isNotEmpty).toList();
    return parts.take(2).map((w) => w[0].toUpperCase()).join();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [QS.mint, QS.teal, QS.deep],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: ring ? Border.all(color: Colors.white, width: 2) : null,
        boxShadow: [
          BoxShadow(
            color: fade(QS.teal, 0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Text(
        initials,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w900,
          fontSize: size * 0.38,
        ),
      ),
    );
  }
}

/* ────────── Controls & Glossy Buttons ────────── */

class QSPage extends StatelessWidget {
  const QSPage({
    super.key,
    this.title,
    this.back = false,
    this.trailing,
    required this.children,
    this.padding = const EdgeInsets.fromLTRB(20, 0, 20, 100),
  });

  final String? title;
  final bool back;
  final Widget? trailing;
  final List<Widget> children;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      body: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (title != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 14),
                child: Row(
                  children: [
                    if (back)
                      Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: InkResponse(
                          onTap: () => Navigator.of(context).maybePop(),
                          radius: 22,
                          child: const Icon(Icons.arrow_back_rounded, size: 24, color: QS.ink),
                        ),
                      ),
                    Expanded(
                      child: Text(
                        title!,
                        style: TextStyle(
                          fontSize: back ? 22 : 26,
                          fontWeight: FontWeight.w900,
                          color: QS.ink,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ),
                    if (trailing != null) trailing!,
                  ],
                ),
              ),
            Expanded(
              child: ListView(padding: padding, children: children),
            ),
          ],
        ),
      ),
    );
  }
}

class SearchField extends StatelessWidget {
  const SearchField({super.key, required this.hint, this.scan = false, this.onChanged});
  final String hint;
  final bool scan;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: QS.line, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: fade(QS.deep, 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.search_rounded, size: 22, color: QS.teal),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              onChanged: onChanged,
              style: const TextStyle(fontSize: 14, color: QS.ink, fontWeight: FontWeight.w500),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: const TextStyle(fontSize: 13.5, color: Color(0xFF94A6A1)),
              ),
            ),
          ),
          if (scan) const Icon(Icons.qr_code_scanner_rounded, size: 22, color: QS.deep),
        ],
      ),
    );
  }
}

class Segments extends StatelessWidget {
  const Segments({super.key, required this.items, required this.value, required this.onChanged});
  final List<String> items;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            Expanded(
              child: GestureDetector(
                onTap: () => onChanged(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 40,
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  decoration: BoxDecoration(
                    gradient: i == value ? QS.primaryGradient : null,
                    color: i == value ? null : Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: i == value ? QS.deep : QS.line, width: 1.2),
                    boxShadow: i == value
                        ? [
                            BoxShadow(
                              color: fade(QS.deep, 0.2),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ]
                        : null,
                  ),
                  child: Text(
                    items[i],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12.5,
                      color: i == value ? Colors.white : QS.body,
                      fontWeight: i == value ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class FilterChips extends StatelessWidget {
  const FilterChips({super.key, required this.items, required this.value, required this.onChanged});
  final List<String> items;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final on = i == value;
          return GestureDetector(
            onTap: () => onChanged(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 18),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                gradient: on ? QS.primaryGradient : null,
                color: on ? null : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: on ? QS.deep : QS.line, width: 1.2),
                boxShadow: on
                    ? [
                        BoxShadow(
                          color: fade(QS.deep, 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ]
                    : null,
              ),
              child: Text(
                items[i],
                style: TextStyle(
                  fontSize: 12.5,
                  color: on ? Colors.white : QS.body,
                  fontWeight: on ? FontWeight.w700 : FontWeight.w600,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

enum BtnStyle { solid, outline, ghostLight, gold }

class QSButton extends StatefulWidget {
  const QSButton({
    super.key,
    required this.label,
    this.onTap,
    this.icon = Icons.arrow_forward_rounded,
    this.style = BtnStyle.solid,
  });

  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final BtnStyle style;

  @override
  State<QSButton> createState() => _QSButtonState();
}

class _QSButtonState extends State<QSButton> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final isGold = widget.style == BtnStyle.gold;
    final solid = widget.style == BtnStyle.solid || isGold;
    final color = widget.style == BtnStyle.outline
        ? QS.teal
        : (isGold ? QS.deep : Colors.white);

    return GestureDetector(
      onTapDown: (_) => setState(() => _down = true),
      onTapUp: (_) => setState(() => _down = false),
      onTapCancel: () => setState(() => _down = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _down ? 0.96 : 1,
        duration: const Duration(milliseconds: 120),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          height: 54,
          decoration: BoxDecoration(
            gradient: isGold
                ? const LinearGradient(
                    colors: [Color(0xFFFFE066), Color(0xFFFFD700), Color(0xFFFFA000)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  )
                : (solid
                    ? const LinearGradient(
                        colors: [Color(0xFF10A48E), Color(0xFF0E937E), Color(0xFF042B25)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      )
                    : null),
            color: widget.style == BtnStyle.ghostLight
                ? fade(Colors.white, 0.12)
                : (solid ? null : Colors.white),
            borderRadius: BorderRadius.circular(27),
            border: Border.all(
              color: solid
                  ? fade(Colors.white, 0.45)
                  : (widget.style == BtnStyle.outline ? QS.teal : QS.mint),
              width: 1.6,
            ),
            boxShadow: _down
                ? [
                    BoxShadow(
                      color: fade(isGold ? QS.gold : QS.deep, 0.2),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [
                    // Top Specular Bevel Highlight
                    BoxShadow(
                      color: fade(Colors.white, 0.6),
                      blurRadius: 2,
                      offset: const Offset(0, -2),
                    ),
                    // 3D Tactile Drop Shadow
                    BoxShadow(
                      color: fade(isGold ? QS.gold : QS.deep, solid ? 0.38 : 0.15),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                    // Base Rim Shadow
                    BoxShadow(
                      color: fade(QS.line, 0.4),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.label,
                style: TextStyle(
                  color: color,
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.3,
                  shadows: solid
                      ? [
                          Shadow(
                            color: fade(Colors.black, 0.3),
                            blurRadius: 3,
                            offset: const Offset(0, 1),
                          ),
                        ]
                      : null,
                ),
              ),
              if (widget.icon != null) ...[
                const SizedBox(width: 8),
                Icon(widget.icon, color: color, size: 20),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class PillButton extends StatelessWidget {
  const PillButton({super.key, required this.label, this.onTap, this.outline = false});
  final String label;
  final VoidCallback? onTap;
  final bool outline;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Material(
        color: outline ? Colors.white : QS.deep,
        shape: StadiumBorder(side: outline ? const BorderSide(color: QS.deep, width: 1.5) : BorderSide.none),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap ?? () {},
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              label,
              style: TextStyle(color: outline ? QS.deep : Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
            ),
          ),
        ),
      ),
    );
  }
}

class Stars extends StatelessWidget {
  const Stars({super.key, required this.rating, this.count});
  final double rating;
  final String? count;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star_rounded, size: 16, color: QS.star),
        const SizedBox(width: 4),
        Text(
          '$rating',
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w800,
            color: QS.ink,
          ),
        ),
        if (count != null) ...[
          const SizedBox(width: 4),
          Text('($count)', style: const TextStyle(fontSize: 12, color: QS.sub)),
        ],
      ],
    );
  }
}

class ProgressLine extends StatelessWidget {
  const ProgressLine({super.key, required this.value, this.height = 6});
  final int value;
  final double height;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: Stack(
        children: [
          Container(height: height, color: const Color(0xFFE6EFEC)),
          FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: (value / 100).clamp(0.0, 1.0),
            child: Container(
              height: height,
              decoration: const BoxDecoration(gradient: LinearGradient(colors: [QS.mint, QS.teal])),
            ),
          ),
        ],
      ),
    );
  }
}

class ProgressRow extends StatelessWidget {
  const ProgressRow({super.key, required this.value});
  final int value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: ProgressLine(value: value)),
        const SizedBox(width: 8),
        Text('$value%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: QS.teal)),
      ],
    );
  }
}

class Meta extends StatelessWidget {
  const Meta({super.key, required this.icon, required this.text, this.color = QS.sub});
  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 3),
      child: Row(
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 5),
          Flexible(
            child: Text(text,
                maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}

class ListRow extends StatelessWidget {
  const ListRow({super.key, required this.leading, required this.child, this.onTap});
  final Widget leading;
  final Widget child;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0xFFEFF5F3)))),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [leading, const SizedBox(width: 14), Expanded(child: child)],
        ),
      ),
    );
  }
}

class RowTitle extends StatelessWidget {
  const RowTitle(this.text, {super.key, this.trailing});
  final String text;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            text,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: QS.ink, height: 1.3),
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

const rowSub = TextStyle(fontSize: 12, color: QS.sub);

class UnderlineTabs extends StatelessWidget {
  const UnderlineTabs({
    super.key,
    required this.items,
    required this.value,
    required this.onChanged,
  });

  final List<String> items;
  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        for (var i = 0; i < items.length; i++)
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => onChanged(i),
            child: Column(
              children: [
                Text(
                  items[i],
                  style: TextStyle(
                    fontSize: 13.5,
                    color: i == value ? QS.deep : QS.sub,
                    fontWeight: i == value ? FontWeight.w800 : FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 3,
                  width: i == value ? 32 : 0,
                  decoration: BoxDecoration(
                    color: QS.teal,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
