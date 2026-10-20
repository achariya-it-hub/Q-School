import 'package:flutter/material.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';

class PartnerPayoutsTab extends StatefulWidget {
  final Partner partner;
  final Function(Partner) onPartnerUpdated;

  const PartnerPayoutsTab({
    super.key,
    required this.partner,
    required this.onPartnerUpdated,
  });

  @override
  State<PartnerPayoutsTab> createState() => _PartnerPayoutsTabState();
}

class _PartnerPayoutsTabState extends State<PartnerPayoutsTab> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _upiController;
  late final TextEditingController _nameController;
  late final TextEditingController _accountController;
  late final TextEditingController _ifscController;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final b = widget.partner.bankDetails;
    _upiController = TextEditingController(text: b.upiId);
    _nameController = TextEditingController(text: b.accountName.isNotEmpty ? b.accountName : widget.partner.name);
    _accountController = TextEditingController(text: b.accountNumber);
    _ifscController = TextEditingController(text: b.ifscCode);
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final updated = await PartnerApiService().updateBankDetails(
        code: widget.partner.code,
        bankDetails: PartnerBankDetails(
          upiId: _upiController.text.trim(),
          accountName: _nameController.text.trim(),
          accountNumber: _accountController.text.trim(),
          ifscCode: _ifscController.text.trim().toUpperCase(),
        ),
      );
      widget.onPartnerUpdated(updated);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payout and bank details saved successfully!'),
          backgroundColor: QS.teal,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not save: $e'),
          backgroundColor: Colors.red[800],
        ),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Earnings Overview Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: QS.primaryGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('TOTAL EARNINGS OVERVIEW', style: TextStyle(color: QS.mint, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.0)),
                const SizedBox(height: 8),
                Text(
                  '₹${widget.partner.stats.totalCommission}',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Paid Out', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11)),
                          const SizedBox(height: 2),
                          Text('₹${widget.partner.stats.paidCommission}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Pending Review', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11)),
                          const SizedBox(height: 2),
                          Text('₹${widget.partner.stats.pendingCommission}', style: const TextStyle(color: QS.mint, fontWeight: FontWeight.bold, fontSize: 15)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Payout Bank Form Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: QS.line),
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Payout Account Details', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: QS.ink)),
                  const SizedBox(height: 4),
                  const Text(
                    'Ensure your UPI ID or Bank account is correct for weekly commission credits.',
                    style: TextStyle(fontSize: 11, color: QS.sub),
                  ),
                  const SizedBox(height: 16),

                  // UPI ID Field
                  TextFormField(
                    controller: _upiController,
                    decoration: InputDecoration(
                      labelText: 'UPI ID (Fastest Transfer)',
                      hintText: 'e.g. name@okaxis or phone@paytm',
                      prefixIcon: const Icon(Icons.flash_on, color: QS.teal, size: 18),
                      filled: true,
                      fillColor: QS.field,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Account Holder Name
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'Account Holder Name',
                      hintText: 'e.g. Bala Murugan',
                      prefixIcon: const Icon(Icons.person, color: QS.teal, size: 18),
                      filled: true,
                      fillColor: QS.field,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Account Number
                  TextFormField(
                    controller: _accountController,
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Bank Account Number',
                      hintText: 'e.g. 5010023456789',
                      prefixIcon: const Icon(Icons.account_balance, color: QS.teal, size: 18),
                      filled: true,
                      fillColor: QS.field,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // IFSC Code
                  TextFormField(
                    controller: _ifscController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: InputDecoration(
                      labelText: 'IFSC Code',
                      hintText: 'e.g. HDFC0001234',
                      prefixIcon: const Icon(Icons.domain, color: QS.teal, size: 18),
                      filled: true,
                      fillColor: QS.field,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: QS.teal,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      onPressed: _saving ? null : _save,
                      child: _saving
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Save Payout Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Payout Guidelines
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: QS.line),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Payout Terms & Guidelines', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: QS.ink)),
                SizedBox(height: 8),
                Text('• Commissions are logged instantly upon student registration in ERP.', style: TextStyle(fontSize: 11, color: QS.body, height: 1.4)),
                SizedBox(height: 4),
                Text('• When the learning centre receives course fee payment, the payout moves to "Approved".', style: TextStyle(fontSize: 11, color: QS.body, height: 1.4)),
                SizedBox(height: 4),
                Text('• Approved balances are disbursed weekly directly to your registered UPI or bank account.', style: TextStyle(fontSize: 11, color: QS.body, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
