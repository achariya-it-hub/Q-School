import 'package:flutter/material.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';

class PartnerAdmissionFormTab extends StatefulWidget {
  final Partner partner;
  final Function(PartnerAdmission) onAdmissionCreated;

  const PartnerAdmissionFormTab({
    super.key,
    required this.partner,
    required this.onAdmissionCreated,
  });

  @override
  State<PartnerAdmissionFormTab> createState() => _PartnerAdmissionFormTabState();
}

class _PartnerAdmissionFormTabState extends State<PartnerAdmissionFormTab> {
  final _formKey = GlobalKey<FormState>();

  final _studentNameController = TextEditingController();
  final _dobController = TextEditingController(text: '2015-06-15');
  final _schoolController = TextEditingController();
  final _parentNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _addressController = TextEditingController();
  final _feeController = TextEditingController(text: '25000');
  final _notesController = TextEditingController();

  String _selectedGrade = 'Grade 5';
  String _selectedCentre = 'mk';
  String _selectedCourse = 'Comprehensive Robotics & AI Program';
  String _selectedPaymentMode = 'Cash';
  String _selectedPaymentStatus = 'Paid';

  bool _submitting = false;
  Map<String, dynamic>? _successResult;

  final List<String> _grades = [
    'Kindergarten',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
  ];

  final List<Map<String, String>> _centres = [
    {'id': 'mk', 'name': 'Moolakulam, Puducherry'},
    {'id': 'vl', 'name': 'Valasaravakkam, Chennai'},
    {'id': 'ad', 'name': 'Adyar, Chennai'},
    {'id': 'tn', 'name': 'Thillai Nagar, Trichy'},
    {'id': 'sc', 'name': 'Saibaba Colony, Coimbatore'},
    {'id': 'wf', 'name': 'Whitefield, Bengaluru'},
  ];

  final List<String> _courses = [
    'Comprehensive Robotics & AI Program',
    'Vedic Mathematics & Speed Math',
    'STEM Explorers Foundation (Grades 1-5)',
    'Python Coding & IoT Kit',
    'BMIT Assessment & Counselling',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.partner.centreId != 'all') {
      _selectedCentre = widget.partner.centreId;
    }
  }

  int get _calculatedCommission {
    final fee = int.tryParse(_feeController.text) ?? 0;
    if (widget.partner.commissionType == 'percentage') {
      return ((fee * widget.partner.commissionValue) / 100).round();
    }
    return widget.partner.commissionValue;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);
    try {
      final req = NewAdmissionRequest(
        partnerCode: widget.partner.code,
        studentName: _studentNameController.text.trim(),
        dob: _dobController.text.trim(),
        grade: _selectedGrade,
        school: _schoolController.text.trim(),
        parentName: _parentNameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim(),
        address: _addressController.text.trim(),
        centreId: _selectedCentre,
        course: _selectedCourse,
        feeAmount: int.tryParse(_feeController.text) ?? 0,
        paymentMode: _selectedPaymentMode,
        paymentStatus: _selectedPaymentStatus,
        notes: _notesController.text.trim(),
      );

      final result = await PartnerApiService().submitAdmission(req);
      final admission = result['admission'] as PartnerAdmission;
      widget.onAdmissionCreated(admission);

      if (!mounted) return;
      setState(() {
        _successResult = result;
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red[800],
        ),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  void _resetForm() {
    setState(() {
      _successResult = null;
      _studentNameController.clear();
      _schoolController.clear();
      _parentNameController.clear();
      _phoneController.clear();
      _emailController.clear();
      _addressController.clear();
      _notesController.clear();
      _feeController.text = '25000';
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_successResult != null) {
      final studentId = _successResult!['studentId'] as String;
      final admission = _successResult!['admission'] as PartnerAdmission;

      return SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF10B981).withOpacity(0.08),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                height: 64,
                width: 64,
                decoration: const BoxDecoration(
                  color: Color(0xFFEAF7EA),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, color: Color(0xFF0A7F0A), size: 40),
              ),
              const SizedBox(height: 16),
              const Text(
                'ADMISSION REGISTERED!',
                style: TextStyle(
                  color: Color(0xFF0A7F0A),
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                admission.studentName,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: QS.ink),
              ),
              const SizedBox(height: 4),
              const Text(
                'Saved directly to Q-School ERP Student Database',
                style: TextStyle(fontSize: 12, color: QS.sub),
              ),
              const SizedBox(height: 20),

              // Student ID Box
              Container(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                decoration: BoxDecoration(
                  color: QS.soft,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: QS.line),
                ),
                child: Column(
                  children: [
                    const Text('PERMANENT ERP STUDENT ID', style: TextStyle(fontSize: 10, color: QS.sub, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(
                      studentId,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: QS.deep,
                        fontFamily: 'monospace',
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Details Summary
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: QS.field,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  children: [
                    _ReceiptRow(label: 'Parent Name', value: admission.parentName),
                    const Divider(height: 14, color: QS.line),
                    _ReceiptRow(label: 'Contact Phone', value: admission.phone),
                    const Divider(height: 14, color: QS.line),
                    _ReceiptRow(label: 'Centre Branch', value: admission.centreName),
                    const Divider(height: 14, color: QS.line),
                    _ReceiptRow(label: 'Course Fee', value: '₹${admission.feeAmount} (${admission.paymentMode})'),
                    const Divider(height: 14, color: QS.line),
                    _ReceiptRow(
                      label: 'Your Commission',
                      value: '+₹${admission.commissionAmount}',
                      valueColor: Colors.green[800]!,
                      isBold: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Action Buttons
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.send, size: 18, color: Colors.white),
                  label: const Text('Send Confirmation to Parent', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF25D366),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Admission slip sent to ${admission.phone}')),
                    );
                  },
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    side: const BorderSide(color: QS.line),
                  ),
                  onPressed: _resetForm,
                  child: const Text('Admit Another Student', style: TextStyle(color: QS.ink, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Info
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: QS.soft,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: QS.line),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user, color: QS.teal, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Direct Field Admission • Attributed to [${widget.partner.code}]',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: QS.deep),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Section 1: Student Details
            const _SectionHeader(number: '1', title: 'STUDENT DETAILS'),
            const SizedBox(height: 10),
            TextFormField(
              controller: _studentNameController,
              decoration: _inputDecoration('Student Full Name *', 'e.g. Aarav Sharma', Icons.person),
              validator: (v) => v?.trim().isEmpty ?? true ? 'Student name is required' : null,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedGrade,
                    decoration: _inputDecoration('Grade / Class', '', Icons.school),
                    items: _grades.map((g) => DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (v) => setState(() => _selectedGrade = v!),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _dobController,
                    decoration: _inputDecoration('Date of Birth', 'YYYY-MM-DD', Icons.calendar_today),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _schoolController,
              decoration: _inputDecoration('Current School', 'e.g. Kendriya Vidyalaya', Icons.apartment),
            ),
            const SizedBox(height: 20),

            // Section 2: Parent Information
            const _SectionHeader(number: '2', title: 'PARENT / GUARDIAN CONTACT'),
            const SizedBox(height: 10),
            TextFormField(
              controller: _parentNameController,
              decoration: _inputDecoration('Parent / Guardian Name *', 'e.g. Vikram Sharma', Icons.badge),
              validator: (v) => v?.trim().isEmpty ?? true ? 'Parent name is required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: _inputDecoration('Mobile Number (WhatsApp) *', 'e.g. 9876543210', Icons.phone),
              validator: (v) => (v?.trim().length ?? 0) < 10 ? 'Enter valid 10-digit number' : null,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: _inputDecoration('Email ID', 'parent@example.com', Icons.email),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _addressController,
                    decoration: _inputDecoration('Town / City', 'e.g. Puducherry', Icons.location_on),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Section 3: Program & Fee
            const _SectionHeader(number: '3', title: 'CENTRE, PROGRAM & FEE'),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: _selectedCentre,
              decoration: _inputDecoration('Centre Branch', '', Icons.store),
              items: _centres.map((c) => DropdownMenuItem(value: c['id'], child: Text(c['name']!, style: const TextStyle(fontSize: 13)))).toList(),
              onChanged: (v) => setState(() => _selectedCentre = v!),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selectedCourse,
              decoration: _inputDecoration('Course / Program', '', Icons.menu_book),
              items: _courses.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12), overflow: TextOverflow.ellipsis))).toList(),
              onChanged: (v) => setState(() => _selectedCourse = v!),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    controller: _feeController,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: _inputDecoration('Course Fee (₹) *', '25000', Icons.currency_rupee),
                    validator: (v) => (int.tryParse(v ?? '') ?? 0) <= 0 ? 'Enter fee' : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: DropdownButtonFormField<String>(
                    value: _selectedPaymentMode,
                    decoration: _inputDecoration('Mode', '', Icons.payment),
                    items: ['Cash', 'UPI', 'Card', 'Net Banking'].map((m) => DropdownMenuItem(value: m, child: Text(m, style: const TextStyle(fontSize: 12)))).toList(),
                    onChanged: (v) => setState(() => _selectedPaymentMode = v!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Live Commission Highlight Box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF7EA),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.green.withOpacity(0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('YOUR EARNED COMMISSION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0A7F0A))),
                      Text('Credited on admission confirmation', style: TextStyle(fontSize: 11, color: QS.sub)),
                    ],
                  ),
                  Text(
                    '+₹$_calculatedCommission',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0A7F0A)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: QS.teal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                onPressed: _submitting ? null : _submit,
                child: _submitting
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                    )
                  : const Text(
                      'Submit Admission to ERP',
                      style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 12, color: QS.sub),
      hintText: hint,
      hintStyle: const TextStyle(fontSize: 12, color: Colors.black26),
      prefixIcon: Icon(icon, size: 18, color: QS.teal),
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: QS.line)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: QS.line)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: QS.teal, width: 1.5)),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String number;
  final String title;

  const _SectionHeader({required this.number, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          height: 22,
          width: 22,
          decoration: const BoxDecoration(
            color: QS.soft,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: QS.teal),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: QS.sub,
            letterSpacing: 1.0,
          ),
        ),
      ],
    );
  }
}

class _ReceiptRow extends StatelessWidget {
  final String label;
  final String value;
  final Color valueColor;
  final bool isBold;

  const _ReceiptRow({
    required this.label,
    required this.value,
    this.valueColor = QS.ink,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: QS.sub)),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            color: valueColor,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
