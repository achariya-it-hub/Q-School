/**
 * Partner referral codes appear in shared links, so they are not secrets. Bank / UPI details are hidden
 * from code-only lookups (only the last 4 digits are shown), and a masked value sent back is never saved.
 */
import type { Partner, PartnerBankDetails } from "./types";

const maskTail = (v?: string) => (v ? `${"X".repeat(Math.max(0, v.length - 4))}${v.slice(-4)}` : v);
const MASKED = /^X+\d{0,4}$/;

export function maskPartner<T extends Partner>(p: T): T {
  if (!p?.bankDetails) return p;
  const b = p.bankDetails;
  return { ...p, bankDetails: { ...b, accountNumber: maskTail(b.accountNumber), upiId: b.upiId ? b.upiId.replace(/^[^@]{0,3}/, "***") : b.upiId } };
}

/** Keep the stored account number / UPI id when the app sends back the masked copy it was shown. */
export function mergeBankDetails(current: PartnerBankDetails | undefined, incoming: PartnerBankDetails): PartnerBankDetails {
  const next = { ...incoming };
  if (next.accountNumber && MASKED.test(next.accountNumber) && current?.accountNumber) next.accountNumber = current.accountNumber;
  if (next.upiId && next.upiId.startsWith("***") && current?.upiId) next.upiId = current.upiId;
  return next;
}
