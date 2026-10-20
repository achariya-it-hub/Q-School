import 'package:flutter/material.dart';

/// Q-School Elite Luxury Brand Tokens
class QS {
  // Deep Luxury Emeralds & Midnights
  static const deeper = Color(0xFF021B17);
  static const deep = Color(0xFF042B25);
  static const darkSurface = Color(0xFF073830);
  static const darkCard = Color(0xFF0A443B);

  // Vivid Neon Accents
  static const teal = Color(0xFF0E937E);
  static const teal500 = Color(0xFF2BB39C);
  static const mint = Color(0xFF00F2C3);
  static const cyan = Color(0xFF00E5FF);
  static const gold = Color(0xFFFFD700);
  static const amber = Color(0xFFFFA000);
  static const purple = Color(0xFF9D4EDD);

  // Neutral Tones
  static const ink = Color(0xFF0B1B18);
  static const sub = Color(0xFF637C76);
  static const body = Color(0xFF384E48);
  static const line = Color(0xFFE2EBE8);
  static const soft = Color(0xFFF2F7F5);
  static const field = Color(0xFFF0F5F3);
  static const star = Color(0xFFFFB800);
  static const red = Color(0xFFFF4757);

  // Luxury Gradients
  static const splashGradient = LinearGradient(
    colors: [Color(0xFF042823), Color(0xFF021714), Color(0xFF010E0C)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const primaryGradient = LinearGradient(
    colors: [Color(0xFF0E937E), Color(0xFF042B25)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const heroGradient = LinearGradient(
    colors: [Color(0xFF0A483F), Color(0xFF0E937E), Color(0xFF00F2C3)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const goldGradient = LinearGradient(
    colors: [Color(0xFFFFD700), Color(0xFFFFA000)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const glassGradient = LinearGradient(
    colors: [Color(0x20FFFFFF), Color(0x05FFFFFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

/// Helper for alpha blending
Color fade(Color c, double opacity) => c.withAlpha((opacity * 255).round());

/// Tactile 3D Embossed Box Decoration for Buttons & Cards
BoxDecoration embossedDecoration({
  Color? color,
  Color? fill,
  Color border = const Color(0xFFFFFFFF),
  double radius = 20.0,
  double? borderRadius,
  bool isPrimary = false,
}) {
  final effectiveColor = fill ?? color;
  final effectiveRadius = borderRadius ?? radius;
  return BoxDecoration(
    gradient: isPrimary
        ? const LinearGradient(
            colors: [Color(0xFF10A48E), Color(0xFF0E937E), Color(0xFF042B25)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          )
        : LinearGradient(
            colors: [
              effectiveColor ?? Colors.white,
              effectiveColor != null ? fade(effectiveColor, 0.95) : const Color(0xFFF2F7F5),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
    borderRadius: BorderRadius.circular(effectiveRadius),
    border: Border.all(
      color: isPrimary ? fade(Colors.white, 0.35) : border,
      width: 1.5,
    ),
    boxShadow: [
      // Top Specular Highlight Shadow
      BoxShadow(
        color: fade(Colors.white, 0.8),
        blurRadius: 2,
        offset: const Offset(0, -2),
      ),
      // Deep 3D Drop Shadow
      BoxShadow(
        color: fade(QS.deep, isPrimary ? 0.32 : 0.08),
        blurRadius: 14,
        offset: const Offset(0, 6),
      ),
      // Ambient Base Rim
      BoxShadow(
        color: fade(QS.line, 0.5),
        blurRadius: 4,
        offset: const Offset(0, 2),
      ),
    ],
  );
}

/// Modern Glassmorphic Box Decoration
BoxDecoration glassDecoration({
  Color? color,
  Color border = const Color(0x22FFFFFF),
  double radius = 18.0,
  List<BoxShadow>? shadows,
}) {
  return BoxDecoration(
    color: color ?? fade(Colors.white, 0.92),
    borderRadius: BorderRadius.circular(radius),
    border: Border.all(color: border, width: 1.2),
    boxShadow: shadows ??
        [
          BoxShadow(
            color: fade(QS.deep, 0.08),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
  );
}

ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: QS.teal,
      primary: QS.deep,
      secondary: QS.mint,
      surface: Colors.white,
    ),
    scaffoldBackgroundColor: const Color(0xFFF7FAF9),
    splashFactory: InkRipple.splashFactory,
    fontFamily: 'Roboto',
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(bodyColor: QS.ink, displayColor: QS.ink),
    inputDecorationTheme: const InputDecorationTheme(
      border: InputBorder.none,
      isDense: true,
      contentPadding: EdgeInsets.zero,
    ),
  );
}
