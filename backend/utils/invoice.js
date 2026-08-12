const { jsPDF } = require("jspdf");

function generateInvoicePDF({
  memberName,
  memberId,
  plan,
  amount,
  date,
  invoiceNo,
  gymName,
}) {
  const doc = new jsPDF();

  // Colors
  const purple = [124, 58, 237];
  const black = [26, 26, 26];
  const gray = [100, 100, 100];
  const light = [245, 240, 255];

  // ── Header Background ──
  doc.setFillColor(...purple);
  doc.rect(0, 0, 210, 45, "F");

  // ── Gym Name ──
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(gymName || "AB Fitness", 15, 20);

  // ── Subtitle ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Invoice", 15, 30);

  // ── Invoice No + Date ──
  doc.setFontSize(9);
  doc.text(`Invoice: ${invoiceNo}`, 140, 20);
  doc.text(
    `Date: ${new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    140,
    28,
  );

  // ── Member Info Box ──
  doc.setFillColor(...light);
  doc.roundedRect(15, 55, 180, 40, 3, 3, "F");

  doc.setTextColor(...black);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Member Details", 20, 68);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(`Name:`, 20, 78);
  doc.text(`Member ID:`, 20, 86);

  doc.setTextColor(...black);
  doc.text(memberName, 55, 78);
  doc.text(memberId, 55, 86);

  // ── Payment Details ──
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...black);
  doc.text("Payment Details", 15, 110);

  // Table Header
  doc.setFillColor(...purple);
  doc.rect(15, 115, 180, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Description", 20, 122);
  doc.text("Plan", 100, 122);
  doc.text("Amount", 165, 122);

  // Table Row
  doc.setFillColor(250, 248, 255);
  doc.rect(15, 125, 180, 12, "F");
  doc.setTextColor(...black);
  doc.setFont("helvetica", "normal");
  doc.text("Gym Membership Fee", 20, 133);
  doc.text(
    plan?.charAt(0).toUpperCase() + plan?.slice(1) || "Monthly",
    100,
    133,
  );
  doc.text(`Rs. ${amount?.toLocaleString("en-IN")}`, 155, 133);

  // Total
  doc.setFillColor(...purple);
  doc.rect(15, 137, 180, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount", 20, 145);
  doc.text(`Rs. ${amount?.toLocaleString("en-IN")}`, 155, 145);

  // ── Payment Status ──
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(15, 158, 180, 15, 3, 3, "F");
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(11);
  doc.text("✓ PAYMENT SUCCESSFUL", 55, 168);

  // ── Footer ──
  doc.setFillColor(...purple);
  doc.rect(0, 270, 210, 27, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for being a member!", 72, 280);
  doc.text(
    `${gymName || "AB Fitness"} — Your fitness journey starts here 💪`,
    45,
    288,
  );

  return doc.output("arraybuffer");
}

module.exports = { generateInvoicePDF };
