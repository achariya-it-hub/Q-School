import 'dart:async';
import 'package:flutter/material.dart';
import '../widgets/brand_logo.dart';

/// First screen of the app: brand splash, then on to "Who's signing in?".
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _fade =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
  Timer? _timer;

  void _next() {
    _timer?.cancel();
    if (mounted) Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  void initState() {
    super.initState();
    _timer = Timer(const Duration(milliseconds: 2400), _next);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _fade.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF011713),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _next,
        child: SafeArea(
          child: Center(
            child: FadeTransition(
              opacity: CurvedAnimation(parent: _fade, curve: Curves.easeOut),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  QSchoolLogo(size: 120, dark: true),
                  SizedBox(height: 22),
                  Text(
                    'Skills for a Brighter Tomorrow',
                    style: TextStyle(color: Colors.white70, fontSize: 15, letterSpacing: 0.3),
                  ),
                  SizedBox(height: 36),
                  SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2.2, color: Color(0xFF00F2C3)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
