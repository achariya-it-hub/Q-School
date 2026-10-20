import 'package:flutter/material.dart';
import '../theme.dart';
import 'admission_form_tab.dart';
import 'admissions_history_tab.dart';
import 'dashboard_tab.dart';
import 'login_screen.dart';
import 'models.dart';
import 'payouts_tab.dart';

class PartnerShell extends StatefulWidget {
  final Partner partner;
  final List<PartnerAdmission> initialAdmissions;

  const PartnerShell({
    super.key,
    required this.partner,
    required this.initialAdmissions,
  });

  @override
  State<PartnerShell> createState() => _PartnerShellState();
}

class _PartnerShellState extends State<PartnerShell> {
  int _currentIndex = 0;
  late Partner _partner;
  late List<PartnerAdmission> _admissions;

  @override
  void initState() {
    super.initState();
    _partner = widget.partner;
    _admissions = widget.initialAdmissions;
  }

  void _onAdmissionCreated(PartnerAdmission newAdmission) {
    setState(() {
      _admissions = [newAdmission, ..._admissions];
      // Increment partner stats locally
      _partner = Partner(
        id: _partner.id,
        code: _partner.code,
        name: _partner.name,
        email: _partner.email,
        phone: _partner.phone,
        organization: _partner.organization,
        category: _partner.category,
        commissionType: _partner.commissionType,
        commissionValue: _partner.commissionValue,
        centreId: _partner.centreId,
        status: _partner.status,
        bankDetails: _partner.bankDetails,
        stats: PartnerStats(
          totalClicks: _partner.stats.totalClicks,
          totalLeads: _partner.stats.totalLeads,
          totalAdmissions: _partner.stats.totalAdmissions + 1,
          totalRevenue: _partner.stats.totalRevenue + newAdmission.feeAmount,
          totalCommission: _partner.stats.totalCommission + newAdmission.commissionAmount,
          paidCommission: _partner.stats.paidCommission,
          pendingCommission: _partner.stats.pendingCommission + newAdmission.commissionAmount,
        ),
        notes: _partner.notes,
      );
    });
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Switch Partner Code?'),
        content: const Text('Are you sure you want to sign out from this marketer profile?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: QS.teal),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const PartnerLoginScreen()),
              );
            },
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final titles = [
      'Partner Dashboard',
      'Make Direct Admission',
      'Admissions Ledger',
      'Earnings & Payouts',
    ];

    return Scaffold(
      backgroundColor: QS.soft,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              titles[_currentIndex],
              style: const TextStyle(
                color: QS.ink,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            Row(
              children: [
                Text(
                  _partner.name,
                  style: const TextStyle(color: QS.sub, fontSize: 11),
                ),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                  decoration: BoxDecoration(
                    color: QS.soft,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: QS.line),
                  ),
                  child: Text(
                    _partner.code,
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: QS.deep,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: QS.sub, size: 20),
            tooltip: 'Switch Partner Code',
            onPressed: _handleLogout,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: QS.line, height: 1),
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          PartnerDashboardTab(
            partner: _partner,
            onNewAdmissionPressed: () => setState(() => _currentIndex = 1),
            onAdmissionsHistoryPressed: () => setState(() => _currentIndex = 2),
          ),
          PartnerAdmissionFormTab(
            partner: _partner,
            onAdmissionCreated: _onAdmissionCreated,
          ),
          PartnerAdmissionsHistoryTab(
            partner: _partner,
            initialAdmissions: _admissions,
          ),
          PartnerPayoutsTab(
            partner: _partner,
            onPartnerUpdated: (updated) => setState(() => _partner = updated),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: QS.line)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: QS.teal,
          unselectedItemColor: QS.sub,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined),
              activeIcon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_add_outlined),
              activeIcon: Icon(Icons.person_add),
              label: 'Admit',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long),
              label: 'Admissions',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Earnings',
            ),
          ],
        ),
      ),
    );
  }
}
