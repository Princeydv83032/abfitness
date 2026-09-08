const { Resend } = require("resend");
const { generateInvoicePDF } = require("./invoice");
const { createClient } = require("@supabase/supabase-js");

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// ── Payment Invoice Email ────────────────────────────
async function sendInvoiceEmail({ member, payment, gymName }) {
  try {
    if (!member.email) {
      console.log(`No email for member: ${member.name}`);
      return false;
    }

    const invoiceNo = `INV-${Date.now()}`;

    // PDF generate karo
    const pdfBuffer = await generateInvoicePDF({
      memberName: member.name,
      memberId: member.member_id,
      plan: payment.plan,
      amount: payment.amount,
      date: payment.paid_at,
      invoiceNo,
      gymName,
    });

    // Email bhejo
    const { error } = await resend.emails.send({
      from: "AB Fitness <noreply@abfitness.devplex.in>",
      to: member.email,
      subject: `✅ Payment Confirmed — ${payment.plan} Plan | ${invoiceNo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏋️ ${gymName || "AB Fitness"}</h1>
            <p style="color: #e9d5ff; margin: 8px 0 0;">Payment Confirmation</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1a1a;">Hi ${member.name}! 👋</h2>
            <p style="color: #555;">Your payment has been received successfully.</p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Member ID</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${member.member_id}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #666;">Plan</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; text-transform: capitalize;">${payment.plan}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #666;">Amount</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #7c3aed;">₹${payment.amount?.toLocaleString("en-IN")}</td>
                </tr>
                <tr style="border-top: 1px solid #f3f4f6;">
                  <td style="padding: 8px 0; color: #666;">Date</td>
                  <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(payment.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                </tr>
                <tr style="border-top: 2px solid #7c3aed; background: #f5f0ff;">
                  <td style="padding: 12px 8px; font-weight: bold; color: #7c3aed;">Total Paid</td>
                  <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #7c3aed; font-size: 18px;">₹${payment.amount?.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </div>

            <div style="background: #dcfce7; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
              <p style="color: #16a34a; font-weight: bold; margin: 0;">✅ Payment Successful!</p>
            </div>

            <p style="color: #555;">Please find your invoice attached to this email.</p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #999; font-size: 12px;">
                ${gymName || "AB Fitness"} — Your fitness journey starts here 💪
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNo}.pdf`,
          content: Buffer.from(pdfBuffer).toString("base64"),
        },
      ],
    });

    if (error) {
      console.log("Email error:", error);
      return false;
    }

    console.log(`Invoice email sent to ${member.email} ✅`);
    return true;
  } catch (err) {
    console.log("sendInvoiceEmail error:", err.message);
    return false;
  }
}

// ── Welcome Email ────────────────────────────────────
async function sendWelcomeEmail({ member, gymName }) {
  try {
    if (!member.email) return false;

    const { error } = await resend.emails.send({
      from: "AB Fitness <noreply@abfitness.devplex.in>",
      to: member.email,
      subject: `🎉 Welcome to ${gymName || "AB Fitness"}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7c3aed; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🏋️ Welcome to ${gymName || "AB Fitness"}!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2>Hi ${member.name}! 💪</h2>
            <p>Your membership has been approved! Welcome to the family.</p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <p><strong>Member ID:</strong> ${member.member_id}</p>
              <p><strong>Plan:</strong> ${member.plan}</p>
            </div>
            <p>Open the app to start your fitness journey! 🚀</p>
          </div>
        </div>
      `,
    });

    // resend.emails.send() resolves with { error } on API-level rejection
    // (e.g. sandbox sender restrictions) instead of throwing - was being
    // silently swallowed here, logging "sent" even when nothing went out
    if (error) {
      console.log("Welcome email rejected by Resend:", error);
      return false;
    }

    console.log(`Welcome email sent to ${member.email} ✅`);
    return true;
  } catch (err) {
    console.log("sendWelcomeEmail error:", err.message);
    return false;
  }
}

module.exports = { sendInvoiceEmail, sendWelcomeEmail };
