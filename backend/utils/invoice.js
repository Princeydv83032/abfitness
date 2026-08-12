const PDFDocument = require("pdfkit");

function generateInvoicePDF({
  memberName,
  memberId,
  plan,
  amount,
  date,
  invoiceNo,
  gymName,
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Header ──────────────────────────────────────
    doc.rect(0, 0, 612, 100).fill("#7c3aed");

    doc
      .fillColor("white")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(gymName || "AB Fitness", 50, 30);

    doc.fontSize(11).font("Helvetica").text("Payment Invoice", 50, 65);

    doc
      .fontSize(9)
      .text(`Invoice: ${invoiceNo}`, 400, 30)
      .text(
        `Date: ${new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`,
        400,
        45,
      );

    // ── Member Info ──────────────────────────────────
    doc.rect(50, 120, 512, 70).fill("#f5f0ff").stroke("#e9d5ff");

    doc
      .fillColor("#1a1a1a")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Member Details", 65, 133);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#555")
      .text("Name:", 65, 153)
      .text("Member ID:", 65, 168);

    doc
      .fillColor("#1a1a1a")
      .text(memberName, 160, 153)
      .text(memberId, 160, 168);

    // ── Payment Details ──────────────────────────────
    doc
      .fillColor("#1a1a1a")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Payment Details", 50, 215);

    // Table Header
    doc.rect(50, 232, 512, 25).fill("#7c3aed");
    doc
      .fillColor("white")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Description", 65, 240)
      .text("Plan", 280, 240)
      .text("Amount", 460, 240);

    // Table Row
    doc.rect(50, 257, 512, 30).fill("#faf8ff").stroke("#e9d5ff");
    doc
      .fillColor("#1a1a1a")
      .fontSize(10)
      .font("Helvetica")
      .text("Gym Membership Fee", 65, 268)
      .text(
        plan?.charAt(0).toUpperCase() + plan?.slice(1) || "Monthly",
        280,
        268,
      )
      .text(`Rs. ${amount?.toLocaleString("en-IN")}`, 445, 268);

    // Total Row
    doc.rect(50, 287, 512, 30).fill("#7c3aed");
    doc
      .fillColor("white")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Total Amount", 65, 298)
      .text(`Rs. ${amount?.toLocaleString("en-IN")}`, 445, 298);

    // ── Payment Status ───────────────────────────────
    doc.rect(50, 335, 512, 35).fill("#dcfce7").stroke("#86efac");
    doc
      .fillColor("#16a34a")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("✓  PAYMENT SUCCESSFUL", 170, 347);

    // ── Footer ───────────────────────────────────────
    doc.rect(0, 750, 612, 92).fill("#7c3aed");
    doc
      .fillColor("white")
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for being a member!", 50, 770, {
        align: "center",
        width: 512,
      })
      .text(
        `${gymName || "AB Fitness"} — Your fitness journey starts here 💪`,
        50,
        790,
        { align: "center", width: 512 },
      );

    doc.end();
  });
}

module.exports = { generateInvoicePDF };
