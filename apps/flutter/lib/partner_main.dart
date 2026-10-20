import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'partner/login_screen.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const QSchoolPartnerApp());
}

class QSchoolPartnerApp extends StatelessWidget {
  const QSchoolPartnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Q-School Partner App',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const PartnerLoginScreen(),
    );
  }
}
