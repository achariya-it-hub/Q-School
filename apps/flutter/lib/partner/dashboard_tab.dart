import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme.dart';
import 'api_service.dart';
import 'models.dart';

class PartnerDashboardTab extends StatelessWidget {
  final Partner partner;
  final VoidCallback onNewAdmissionPressed;
  final VoidCallback onAdmissionsHistoryPressed;

  const PartnerDashboardTab({
    super.key,
    required this.partner,
    required this.onNewAdmissionPressed,
    required this.onAdmissionsHistoryPressed,
  });

  String get _referralUrl {
    final base = PartnerApiService().baseUrl;
    return '$base/partner/admit?ref=${partner.code}';
  }

  void _copyLink(BuildContext context) {
    Clipboard.setData(ClipboardData(text: _referralUrl));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Referral link copied to clipboard!'),
        backgroundColor: QS.teal,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _showQrDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Center(
          child: Text(
            'Partner Code: ${partner.code}',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: QS.ink),
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Parents can scan this QR code with any phone camera to apply with your referral code automatically.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: QS.sub),
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: QS.soft,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: QS.line),
              ),
              child: Image.network(
                'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${Uri.encodeComponent(_referralUrl)}',
                height: 180,
                width: 180,
                errorBuilder: (_, __, ___) => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('QR Code Preview', style: TextStyle(color: QS.sub, fontSize: 12)),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _referralUrl,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10, color: QS.sub, fontFamily: 'monospace'),
            ),
          ],
        ),
        actions: [
          Center(
            child: TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close', style: TextStyle(color: QS.teal, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Partner Header Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: QS.primaryGradient,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: QS.deep.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: Colors.white.withOpacity(0.15),
                  child: Text(
                    partner.name.isNotEmpty ? partner.name[0].toUpperCase() : 'P',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              partner.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: QS.mint,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              partner.code,
                              style: const TextStyle(
                                color: QS.deeper,
                                fontSize: 10,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${partner.category} • ${partner.organization.isNotEmpty ? partner.organization : "Q-School Marketer"}',
                        style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Commission: ${partner.commissionValue}${partner.commissionType == "percentage" ? "%" : "₹ flat per student"}',
                        style: const TextStyle(color: QS.mint, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // KPI Grid (2x2)
          Row(
            children: [
              Expanded(
                child: _KpiTile(
                  label: 'ADMISSIONS CONVERTED',
                  value: '${partner.stats.totalAdmissions}',
                  subtitle: 'Synced with ERP',
                  icon: Icons.school,
                  iconColor: QS.teal,
                  valueColor: QS.ink,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _KpiTile(
                  label: 'COMMISSION EARNED',
                  value: '₹${partner.stats.totalCommission}',
                  subtitle: 'Earned to date',
                  icon: Icons.payments,
                  iconColor: Colors.green,
                  valueColor: Colors.green[800]!,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _KpiTile(
                  label: 'PENDING PAYOUT',
                  value: '₹${partner.stats.pendingCommission}',
                  subtitle: 'Under verification',
                  icon: Icons.pending_actions,
                  iconColor: Colors.amber[800]!,
                  valueColor: Colors.amber[900]!,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _KpiTile(
                  label: 'GROSS FEES GENERATED',
                  value: '₹${partner.stats.totalRevenue}',
                  subtitle: '${partner.stats.totalClicks} clicks',
                  icon: Icons.trending_up,
                  iconColor: QS.teal500,
                  valueColor: QS.deep,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Share Referral Link Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: QS.line),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: QS.soft,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.share, color: QS.teal, size: 18),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your Direct Referral Link',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: QS.ink),
                          ),
                          Text(
                            'Share via WhatsApp or show QR code to parents',
                            style: TextStyle(color: QS.sub, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: QS.field,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          _referralUrl,
                          style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: QS.body),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () => _copyLink(context),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          child: Text(
                            'COPY',
                            style: TextStyle(color: QS.teal, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.qr_code, size: 16, color: QS.teal),
                        label: const Text('Show QR Code', style: TextStyle(color: QS.teal, fontSize: 12)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: QS.teal),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                        ),
                        onPressed: () => _showQrDialog(context),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.copy, size: 16, color: Colors.white),
                        label: const Text('Copy Link', style: TextStyle(color: Colors.white, fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: QS.teal,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 11),
                          elevation: 0,
                        ),
                        onPressed: () => _copyLink(context),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Primary Action Card
          InkWell(
            onTap: onNewAdmissionPressed,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF06473E), Color(0xFF0B6E5F)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: QS.teal.withOpacity(0.25),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    height: 48,
                    width: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.person_add, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Make Direct Admission',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Enroll a student on the field & register into ERP',
                          style: TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Secondary Action: Ledger
          InkWell(
            onTap: onAdmissionsHistoryPressed,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: QS.line),
              ),
              child: const Row(
                children: [
                  Icon(Icons.list_alt, color: QS.sub, size: 20),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'View All My Admissions Ledger',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: QS.ink),
                    ),
                  ),
                  Icon(Icons.chevron_right, color: QS.sub, size: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiTile extends StatelessWidget {
  final String label;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final Color valueColor;

  const _KpiTile({
    required this.label,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    required this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: QS.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: QS.sub,
                    letterSpacing: 0.5,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Icon(icon, size: 16, color: iconColor),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: valueColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 10, color: QS.sub),
          ),
        ],
      ),
    );
  }
}
