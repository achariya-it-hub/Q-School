import 'package:flutter_test/flutter_test.dart';
import 'package:qschool/main.dart';

void main() {
  testWidgets('Welcome screen shows the onboarding CTA', (tester) async {
    await tester.pumpWidget(const QSchoolApp());
    expect(find.text('Next'), findsOneWidget);
    expect(find.textContaining('Already have an account?'), findsOneWidget);
  });
}
