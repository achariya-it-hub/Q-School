import 'package:flutter/material.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';

class PartnerAdmissionsHistoryTab extends StatefulWidget {
  final Partner partner;
  final List<PartnerAdmission> initialAdmissions;

  const PartnerAdmissionsHistoryTab({
    super.key,
    required this.partner,
    required this.initialAdmissions,
  });

  @override
  State<PartnerAdmissionsHistoryTab> createState() => _PartnerAdmissionsHistoryTabState();
}

class _PartnerAdmissionsHistoryTabState extends State<PartnerAdmissionsHistoryTab> {
  late List<PartnerAdmission> _admissions;
  String _searchQuery = '';
  bool _refreshing = false;

  @override
  void initState() {
    super.initState();
    _admissions = widget.initialAdmissions;
  }

  Future<void> _refresh() async {
    setState(() => _refreshing = true);
    try {
      final updated = await PartnerApiService().fetchAdmissions(widget.partner.code);
      if (!mounted) return;
      setState(() => _admissions = updated);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Refresh failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _refreshing = false);
    }
  }

  List<PartnerAdmission> get _filteredList {
    if (_searchQuery.trim().isEmpty) return _admissions;
    final q = _searchQuery.toLowerCase();
    return _admissions.where((a) {
      return a.studentName.toLowerCase().contains(q) ||
          a.studentId.toLowerCase().contains(q) ||
          a.parentName.toLowerCase().contains(q) ||
          a.phone.contains(q) ||
          a.centreName.toLowerCase().contains(q);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final list = _filteredList;

    return RefreshIndicator(
      onRefresh: _refresh,
      color: QS.teal,
      child: Column(
        children: [
          // Search & Summary Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search student, parent, ERP ID…',
                      hintStyle: const TextStyle(fontSize: 12, color: QS.sub),
                      prefixIcon: const Icon(Icons.search, size: 18, color: QS.sub),
                      filled: true,
                      fillColor: QS.field,
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                IconButton(
                  icon: _refreshing
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.refresh, color: QS.teal),
                  onPressed: _refreshing ? null : _refresh,
                  tooltip: 'Sync with ERP',
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: QS.line),

          // List Body
          Expanded(
            child: list.isEmpty
              ? ListView(
                  padding: const EdgeInsets.all(32),
                  children: [
                    const SizedBox(height: 40),
                    const Icon(Icons.people_outline, size: 48, color: QS.line),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        _searchQuery.isNotEmpty ? 'No admissions match your search' : 'No admissions recorded yet',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: QS.body, fontSize: 14),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Center(
                      child: Text(
                        'Admissions made using your referral code will appear here.',
                        style: TextStyle(color: QS.sub, fontSize: 12),
                      ),
                    ),
                  ],
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (ctx, i) {
                    final item = list[i];
                    return _AdmissionCard(admission: item);
                  },
                ),
          ),
        ],
      ),
    );
  }
}

class _AdmissionCard extends StatelessWidget {
  final PartnerAdmission admission;

  const _AdmissionCard({required this.admission});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: QS.line),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Student Name & ID Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  admission.studentName,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: QS.ink),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: QS.soft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  admission.studentId,
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: QS.deep,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),

          // Course & Centre
          Text(
            '${admission.course} • ${admission.centreName}',
            style: const TextStyle(fontSize: 11, color: QS.sub),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 10),

          // Parent contact
          Row(
            children: [
              const Icon(Icons.person, size: 14, color: QS.sub),
              const SizedBox(width: 4),
              Text(
                admission.parentName,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: QS.body),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.phone, size: 14, color: QS.sub),
              const SizedBox(width: 4),
              Text(
                admission.phone,
                style: const TextStyle(fontSize: 12, color: QS.body, fontFamily: 'monospace'),
              ),
            ],
          ),
          const Divider(height: 18, color: QS.line),

          // Bottom Row: Financials and Status Badges
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('FEE / COMMISSION', style: TextStyle(fontSize: 9, color: QS.sub, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text('₹${admission.feeAmount}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: QS.body)),
                      const SizedBox(width: 6),
                      Text('+₹${admission.commissionAmount}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0A7F0A))),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  // ERP Status Chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: admission.erpStatus == 'Active' ? const Color(0xFFEAF7EA) : const Color(0xFFFFF6E0),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'ERP: ${admission.erpStatus}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: admission.erpStatus == 'Active' ? const Color(0xFF0A7F0A) : const Color(0xFF8A5A00),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  // Payout Status Chip
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: admission.payoutStatus == 'Paid' ? const Color(0xFFEAF7EA) : const Color(0xFFEEF1FB),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      admission.payoutStatus,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: admission.payoutStatus == 'Paid' ? const Color(0xFF0A7F0A) : const Color(0xFF3B4CA8),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
