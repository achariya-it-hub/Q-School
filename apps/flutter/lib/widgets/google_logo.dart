import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';

/// Crisp vector-painted official 4-color Google 'G' mark (zero external SVG dependency).
class GoogleGLogo extends StatelessWidget {
  const GoogleGLogo({super.key, this.size = 20});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _GoogleGPainter()),
    );
  }
}

class _GoogleGPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final stroke = size.width * 0.21;
    final rect = Rect.fromLTWH(
      stroke / 2,
      stroke / 2,
      size.width - stroke,
      size.height - stroke,
    );

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.butt;

    double deg(double d) => d * math.pi / 180.0;

    // Blue right-bottom arc
    paint.color = const Color(0xFF4285F4);
    canvas.drawArc(rect, deg(-12), deg(72), false, paint);

    // Green bottom arc
    paint.color = const Color(0xFF34A853);
    canvas.drawArc(rect, deg(58), deg(94), false, paint);

    // Yellow left arc
    paint.color = const Color(0xFFFBBC05);
    canvas.drawArc(rect, deg(150), deg(62), false, paint);

    // Red top arc
    paint.color = const Color(0xFFEA4335);
    canvas.drawArc(rect, deg(210), deg(102), false, paint);

    // Horizontal blue crossbar of the 'G'
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;

    canvas.drawRect(
      Rect.fromLTWH(
        size.width * 0.50,
        size.height * 0.405,
        size.width * 0.47,
        stroke * 0.92,
      ),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Full-width tactile "Continue with Gmail" button for Q-School light & dark auth screens.
class GmailSignInButton extends StatelessWidget {
  const GmailSignInButton({
    super.key,
    required this.onTap,
    this.loading = false,
    this.label = 'Sign in with Gmail',
    this.darkSurface = false,
  });

  final VoidCallback? onTap;
  final bool loading;
  final String label;
  final bool darkSurface;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: darkSurface ? const Color(0xFF0A3831) : Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: loading ? null : onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 18),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: darkSurface ? Colors.white.withValues(alpha: 0.18) : QS.line,
              width: 1.4,
            ),
            boxShadow: [
              BoxShadow(
                color: darkSurface
                    ? Colors.black.withValues(alpha: 0.22)
                    : fade(QS.deep, 0.06),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (loading)
                SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.3,
                    color: darkSurface ? QS.mint : QS.teal,
                  ),
                )
              else
                Container(
                  width: 28,
                  height: 28,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: darkSurface
                        ? null
                        : [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.06),
                              blurRadius: 4,
                            ),
                          ],
                  ),
                  child: const GoogleGLogo(size: 18),
                ),
              const SizedBox(width: 12),
              Flexible(
                child: Text(
                  loading ? 'Connecting to Gmail...' : label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14.5,
                    fontWeight: FontWeight.w800,
                    color: darkSurface ? Colors.white : QS.ink,
                    letterSpacing: 0.1,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

