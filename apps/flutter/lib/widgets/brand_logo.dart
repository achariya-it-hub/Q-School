import 'package:flutter/material.dart';

class QSchoolLogo extends StatelessWidget {
  const QSchoolLogo({
    super.key,
    this.size = 36.0,
    this.dark = false,
    this.showTagline = false,
    this.taglineText = 'QUANTUM SCHOOLING',
  });

  final double size;
  final bool dark;
  final bool showTagline;
  final String taglineText;

  @override
  Widget build(BuildContext context) {
    final assetPath = dark ? 'assets/images/logo-light.png' : 'assets/images/logo.png';

    return Image.asset(
      assetPath,
      height: size,
      fit: BoxFit.contain,
    );
  }
}
