import 'package:flutter/material.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets/kit.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  int _selectedMethod = 0; // 0: UPI, 1: Card, 2: NetBanking, 3: Wallet
  bool _agreeTerms = true;

  void _processPayment() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: QS.primaryGradient,
                boxShadow: [
                  BoxShadow(
                    color: fade(QS.teal, 0.4),
                    blurRadius: 16,
                  ),
                ],
              ),
              child: const Icon(Icons.check_rounded, size: 36, color: Colors.white),
            ),
            const SizedBox(height: 18),
            const Text(
              'Payment Successful! 🎉',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: QS.ink),
            ),
            const SizedBox(height: 8),
            const Text(
              'You are now enrolled in Mind & Memory Mastery. Happy learning!',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13.5, color: QS.sub),
            ),
            const SizedBox(height: 24),
            QSButton(
              label: 'Go to My Courses',
              onTap: () {
                Navigator.of(context).pop();
                Navigator.of(context).pushNamedAndRemoveUntil('/app', (_) => false);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF9),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: QS.ink),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
        title: const Text(
          'Payment',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w900,
            color: QS.ink,
          ),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Purchased Item Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: QS.line, width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: fade(QS.deep, 0.05),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const ArtThumb(
                          art: Art.bulb,
                          width: 64,
                          height: 64,
                          radius: 14,
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'Mind & Memory Mastery in Daily Life',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 14.5,
                                  fontWeight: FontWeight.w800,
                                  color: QS.ink,
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                '12 Aug 2025 • 10:00 AM\nLive Webinar',
                                style: TextStyle(fontSize: 12, color: QS.sub),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 26),

                  // Price Details Table
                  const Text(
                    'Price Details',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 14),
                  _rowPrice('Course Fee', '₹999'),
                  _rowPrice('Platform Fee', '₹0'),
                  _rowPrice('Discount', '- ₹500', isDiscount: true),
                  const Divider(height: 28, color: QS.line),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        'Total Amount',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w900,
                          color: QS.ink,
                        ),
                      ),
                      Text(
                        '₹ 499',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: QS.deep,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),

                  // Select Payment Method
                  const Text(
                    'Select Payment Method',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: QS.ink,
                    ),
                  ),
                  const SizedBox(height: 14),

                  _paymentTile(0, 'UPI', 'Pay via UPI apps (GPay, PhonePe, Paytm)', Icons.account_balance_wallet_rounded),
                  _paymentTile(1, 'Debit / Credit Card', 'Visa, Mastercard, RuPay', Icons.credit_card_rounded),
                  _paymentTile(2, 'Net Banking', 'All major Indian banks', Icons.account_balance_rounded),
                  _paymentTile(3, 'Wallet', 'Paytm / Amazon Pay / PhonePe', Icons.wallet_rounded),
                  const SizedBox(height: 16),

                  // Checkbox
                  Row(
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: Checkbox(
                          value: _agreeTerms,
                          activeColor: QS.deep,
                          onChanged: (v) => setState(() => _agreeTerms = v ?? true),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'I agree to Terms & Conditions',
                          style: TextStyle(fontSize: 13, color: QS.sub, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Pay Button Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: QSButton(
                label: 'Pay ₹499 Securely',
                onTap: _processPayment,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _rowPrice(String label, String value, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13.5, color: QS.sub)),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDiscount ? QS.teal : QS.ink,
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentTile(int index, String title, String sub, IconData icon) {
    final selected = _selectedMethod == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? QS.teal : QS.line,
            width: selected ? 2 : 1.2,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: fade(QS.teal, 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Icon(icon, size: 24, color: selected ? QS.deep : QS.sub),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                      color: QS.ink,
                    ),
                  ),
                  Text(
                    sub,
                    style: const TextStyle(fontSize: 11.5, color: QS.sub),
                  ),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected ? QS.teal : QS.sub,
                  width: selected ? 6 : 1.5,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
