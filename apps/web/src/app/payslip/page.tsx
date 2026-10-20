"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { inr, monthLabel, numberToWords, type PayLine } from "@qschool/shared";

interface Slip {
  line: PayLine;
  status: string;
  paidOn: string | null;
}

function Slip_() {
  const sp = useSearchParams();
  const month = sp.get("month") ?? "";
  const id = sp.get("id") ?? "";
  const [slip, setSlip] = useState<Slip | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/payroll/payslip?month=${month}&id=${id}`)
      .then((r) => r.json())
      .then((d) => (d.ok ? setSlip(d) : setErr(d.error ?? "Could not load payslip")))
      .catch(() => setErr("Could not load payslip"));
  }, [month, id]);

  if (err) return <p style={{ padding: 40, fontFamily: "sans-serif" }}>{err}</p>;
  if (!slip) return <p style={{ padding: 40, fontFamily: "sans-serif" }}>Loading…</p>;
  const l = slip.line;

  const earn: [string, number][] = [["Basic", l.basic], ["House rent allowance", l.hra], ["Special allowance", l.special]];
  if (l.bonus) earn.push(["Bonus / incentive", l.bonus]);
  const ded: [string, number][] = [["Provident fund", l.pf], ["ESI", l.esi], ["Professional tax", l.pt], ["TDS", l.tds]];
  if (l.otherDeduction) ded.push(["Other deductions", l.otherDeduction]);
  const rows = Math.max(earn.length, ded.length);
  const td: React.CSSProperties = { padding: "7px 10px", border: "1px solid #d5d9e0" };

  return (
    <div style={{ background: "#eef0f4", minHeight: "100vh", padding: 24, fontFamily: "Inter, system-ui, sans-serif", color: "#1b2233" }}>
      <style>{`@media print{body{background:#fff}.noprint{display:none!important}.sheet{box-shadow:none!important;margin:0!important}}`}</style>
      <div className="noprint" style={{ maxWidth: 780, margin: "0 auto 12px", textAlign: "right" }}>
        <button onClick={() => window.print()} style={{ padding: "8px 18px", borderRadius: 8, border: 0, background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          Print / Save as PDF
        </button>
      </div>
      <div className="sheet" style={{ maxWidth: 780, margin: "0 auto", background: "#fff", padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        <div style={{ textAlign: "center", borderBottom: "2px solid #1b2233", paddingBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Q-School</h1>
          <div style={{ fontSize: 13, color: "#566" }}>Payslip for {monthLabel(month)}{slip.status === "Draft" ? " (DRAFT)" : ""}</div>
        </div>

        <table style={{ width: "100%", fontSize: 13, margin: "16px 0", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={td}><b>Employee</b></td><td style={td}>{l.name}</td><td style={td}><b>Employee ID</b></td><td style={td}>{l.staffId}</td></tr>
            <tr><td style={td}><b>Designation</b></td><td style={td}>{l.role}</td><td style={td}><b>Department</b></td><td style={td}>{l.dept}</td></tr>
            <tr><td style={td}><b>Branch</b></td><td style={td}>{l.centre}</td><td style={td}><b>Bank A/c</b></td><td style={td}>{l.account ? `${l.bank ?? ""} ${l.account}` : "—"}</td></tr>
            <tr><td style={td}><b>Days in month</b></td><td style={td}>{l.daysInMonth}</td><td style={td}><b>Payable days</b></td><td style={td}>{l.payableDays}</td></tr>
            <tr><td style={td}><b>Loss of pay days</b></td><td style={td}>{l.lopDays}</td><td style={td}><b>Paid leave / WFH</b></td><td style={td}>{l.paidLeave} / {l.wfh}</td></tr>
          </tbody>
        </table>

        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f3f4f8" }}>
              <th style={{ ...td, textAlign: "left" }}>Earnings</th><th style={{ ...td, textAlign: "right" }}>Amount</th>
              <th style={{ ...td, textAlign: "left" }}>Deductions</th><th style={{ ...td, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              <tr key={i}>
                <td style={td}>{earn[i]?.[0] ?? ""}</td><td style={{ ...td, textAlign: "right" }}>{earn[i] ? inr(earn[i][1]) : ""}</td>
                <td style={td}>{ded[i]?.[0] ?? ""}</td><td style={{ ...td, textAlign: "right" }}>{ded[i] ? inr(ded[i][1]) : ""}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, background: "#f3f4f8" }}>
              <td style={td}>Gross earnings</td><td style={{ ...td, textAlign: "right" }}>{inr(l.gross)}</td>
              <td style={td}>Total deductions</td><td style={{ ...td, textAlign: "right" }}>{inr(l.totalDeductions)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 16, padding: 12, border: "2px solid #1b2233", fontSize: 15 }}>
          <b>Net pay: {inr(l.net)}</b>
          <div style={{ fontSize: 12, color: "#566", marginTop: 4 }}>{numberToWords(Math.round(l.net))}</div>
        </div>
        {l.note && <p style={{ fontSize: 12, marginTop: 10 }}>Note: {l.note}</p>}
        <p style={{ fontSize: 11, color: "#889", marginTop: 24 }}>This is a computer-generated payslip and does not require a signature.</p>
      </div>
    </div>
  );
}

export default function PayslipPage() {
  return (
    <Suspense fallback={null}>
      <Slip_ />
    </Suspense>
  );
}
