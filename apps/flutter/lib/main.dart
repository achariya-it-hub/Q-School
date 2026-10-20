import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/ai_assistant.dart';
import 'screens/certificates.dart';
import 'screens/course_detail.dart';
import 'screens/help_support.dart';
import 'screens/interests.dart';
import 'screens/live_class.dart';
import 'screens/login.dart';
import 'screens/notes.dart';
import 'screens/notifications.dart';
import 'screens/offline.dart';
import 'screens/orders.dart';
import 'screens/payment.dart';
import 'screens/saved_courses.dart';
import 'screens/settings.dart';
import 'screens/shell.dart';
import 'screens/signup.dart';
import 'screens/webinars.dart';
import 'screens/welcome.dart';
import 'screens/workshops.dart';
import 'partner/login_screen.dart';
import 'theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const QSchoolApp());
}

class QSchoolApp extends StatelessWidget {
  const QSchoolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Q-School',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      initialRoute: '/',
      routes: {
        '/': (_) => const WelcomeScreen(),
        '/login': (_) => const LoginScreen(),
        '/signup': (_) => const SignupScreen(),
        '/interests': (_) => const InterestsScreen(),
        '/app': (_) => const AppShell(),
        '/partner': (_) => const PartnerLoginScreen(),
        '/live': (_) => const LiveClassScreen(),
        '/payment': (_) => const PaymentScreen(),
        '/ai_assistant': (_) => const AiAssistantScreen(),
        '/workshops': (_) => const WorkshopsScreen(),
        '/webinars': (_) => const WebinarsScreen(),
        '/offline': (_) => const OfflineScreen(),
        '/certificates': (_) => const CertificatesScreen(),
        '/orders': (_) => MyOrdersScreen(),
        '/saved_courses': (_) => const SavedCoursesScreen(),
        '/notes': (_) => const MyNotesScreen(),
        '/notifications': (_) => const NotificationsScreen(),
        '/help_support': (_) => const HelpSupportScreen(),
        '/settings': (_) => const SettingsScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/course') {
          final slug = settings.arguments as String?;
          return MaterialPageRoute(
            builder: (_) => CourseDetailScreen(slug: slug),
            settings: settings,
          );
        }
        return null;
      },
    );
  }
}
