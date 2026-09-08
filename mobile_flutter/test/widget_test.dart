import 'package:flutter_test/flutter_test.dart';
import 'package:shilpsetu_mobile/main.dart';

void main() {
  testWidgets('ShilpSetuApp smoke test', (WidgetTester tester) async {
    // Build ShilpSetuApp
    await tester.pumpWidget(const ShilpSetuApp());
    expect(find.byType(ShilpSetuApp), findsOneWidget);
  });
}
