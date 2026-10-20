
class PartnerStats {
  final int totalClicks;
  final int totalLeads;
  final int totalAdmissions;
  final int totalRevenue;
  final int totalCommission;
  final int paidCommission;
  final int pendingCommission;

  PartnerStats({
    this.totalClicks = 0,
    this.totalLeads = 0,
    this.totalAdmissions = 0,
    this.totalRevenue = 0,
    this.totalCommission = 0,
    this.paidCommission = 0,
    this.pendingCommission = 0,
  });

  factory PartnerStats.fromJson(Map<String, dynamic> json) {
    return PartnerStats(
      totalClicks: json['totalClicks'] ?? 0,
      totalLeads: json['totalLeads'] ?? 0,
      totalAdmissions: json['totalAdmissions'] ?? 0,
      totalRevenue: json['totalRevenue'] ?? 0,
      totalCommission: json['totalCommission'] ?? 0,
      paidCommission: json['paidCommission'] ?? 0,
      pendingCommission: json['pendingCommission'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'totalClicks': totalClicks,
        'totalLeads': totalLeads,
        'totalAdmissions': totalAdmissions,
        'totalRevenue': totalRevenue,
        'totalCommission': totalCommission,
        'paidCommission': paidCommission,
        'pendingCommission': pendingCommission,
      };
}

class PartnerBankDetails {
  final String upiId;
  final String accountName;
  final String accountNumber;
  final String ifscCode;

  PartnerBankDetails({
    this.upiId = '',
    this.accountName = '',
    this.accountNumber = '',
    this.ifscCode = '',
  });

  factory PartnerBankDetails.fromJson(Map<String, dynamic> json) {
    return PartnerBankDetails(
      upiId: json['upiId'] ?? '',
      accountName: json['accountName'] ?? '',
      accountNumber: json['accountNumber'] ?? '',
      ifscCode: json['ifscCode'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'upiId': upiId,
        'accountName': accountName,
        'accountNumber': accountNumber,
        'ifscCode': ifscCode,
      };
}

class Partner {
  final String id;
  final String code;
  final String name;
  final String email;
  final String phone;
  final String organization;
  final String category;
  final String commissionType; // percentage or flat
  final int commissionValue;
  final String centreId;
  final String status;
  final PartnerBankDetails bankDetails;
  final PartnerStats stats;
  final String notes;

  Partner({
    required this.id,
    required this.code,
    required this.name,
    required this.email,
    required this.phone,
    this.organization = '',
    this.category = 'Marketing Team',
    this.commissionType = 'percentage',
    this.commissionValue = 10,
    this.centreId = 'all',
    this.status = 'active',
    required this.bankDetails,
    required this.stats,
    this.notes = '',
  });

  factory Partner.fromJson(Map<String, dynamic> json) {
    return Partner(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      organization: json['organization'] ?? '',
      category: json['category'] ?? 'Marketing Team',
      commissionType: json['commissionType'] ?? 'percentage',
      commissionValue: json['commissionValue'] ?? 10,
      centreId: json['centreId'] ?? 'all',
      status: json['status'] ?? 'active',
      bankDetails: json['bankDetails'] != null
          ? PartnerBankDetails.fromJson(json['bankDetails'])
          : PartnerBankDetails(),
      stats: json['stats'] != null
          ? PartnerStats.fromJson(json['stats'])
          : PartnerStats(),
      notes: json['notes'] ?? '',
    );
  }
}

class PartnerAdmission {
  final String id;
  final String partnerId;
  final String partnerCode;
  final String partnerName;
  final String studentId;
  final String studentName;
  final String dob;
  final String grade;
  final String school;
  final String parentName;
  final String phone;
  final String email;
  final String address;
  final String centreId;
  final String centreName;
  final String course;
  final int feeAmount;
  final int commissionAmount;
  final String paymentMode;
  final String paymentStatus;
  final String erpStatus;
  final String payoutStatus;
  final String createdAt;

  PartnerAdmission({
    required this.id,
    required this.partnerId,
    required this.partnerCode,
    required this.partnerName,
    required this.studentId,
    required this.studentName,
    this.dob = '',
    required this.grade,
    this.school = '',
    required this.parentName,
    required this.phone,
    this.email = '',
    this.address = '',
    required this.centreId,
    required this.centreName,
    required this.course,
    required this.feeAmount,
    required this.commissionAmount,
    this.paymentMode = 'Cash',
    this.paymentStatus = 'Paid',
    this.erpStatus = 'Pending',
    this.payoutStatus = 'Pending',
    required this.createdAt,
  });

  factory PartnerAdmission.fromJson(Map<String, dynamic> json) {
    return PartnerAdmission(
      id: json['id'] ?? '',
      partnerId: json['partnerId'] ?? '',
      partnerCode: json['partnerCode'] ?? '',
      partnerName: json['partnerName'] ?? '',
      studentId: json['studentId'] ?? '',
      studentName: json['studentName'] ?? '',
      dob: json['dob'] ?? '',
      grade: json['grade'] ?? '',
      school: json['school'] ?? '',
      parentName: json['parentName'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      address: json['address'] ?? '',
      centreId: json['centreId'] ?? '',
      centreName: json['centreName'] ?? '',
      course: json['course'] ?? '',
      feeAmount: json['feeAmount'] ?? 0,
      commissionAmount: json['commissionAmount'] ?? 0,
      paymentMode: json['paymentMode'] ?? 'Cash',
      paymentStatus: json['paymentStatus'] ?? 'Paid',
      erpStatus: json['erpStatus'] ?? 'Pending',
      payoutStatus: json['payoutStatus'] ?? 'Pending',
      createdAt: json['createdAt'] ?? '',
    );
  }
}

class NewAdmissionRequest {
  final String partnerCode;
  final String studentName;
  final String dob;
  final String grade;
  final String school;
  final String parentName;
  final String phone;
  final String email;
  final String address;
  final String centreId;
  final String course;
  final int feeAmount;
  final String paymentMode;
  final String paymentStatus;
  final String notes;

  NewAdmissionRequest({
    required this.partnerCode,
    required this.studentName,
    this.dob = '',
    required this.grade,
    this.school = '',
    required this.parentName,
    required this.phone,
    this.email = '',
    this.address = '',
    required this.centreId,
    required this.course,
    required this.feeAmount,
    this.paymentMode = 'Cash',
    this.paymentStatus = 'Paid',
    this.notes = '',
  });

  Map<String, dynamic> toJson() => {
        'partnerCode': partnerCode,
        'studentName': studentName,
        'dob': dob,
        'grade': grade,
        'school': school,
        'parentName': parentName,
        'phone': phone,
        'email': email,
        'address': address,
        'centreId': centreId,
        'course': course,
        'feeAmount': feeAmount,
        'paymentMode': paymentMode,
        'paymentStatus': paymentStatus,
        'notes': notes,
      };
}
