// ═══════════════════════════════════════════════════════════════════════════════
// Email Service — Brevo (Sendinblue) integration
// ═══════════════════════════════════════════════════════════════════════════════

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

type EmailParams = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
};

async function sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return { success: false, error: 'BREVO_API_KEY not configured' };

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@integrityengine.app';
  const senderName = process.env.BREVO_SENDER_NAME || 'IntegrityEngine';

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Brevo email error:', body);
      return { success: false, error: `Brevo API error: ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: 'Failed to send email' };
  }
}

// ─── Template: Welcome Email ────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, fullName: string, role: string) {
  return sendEmail({
    to: [{ email, name: fullName }],
    subject: 'Welcome to Integrity Engine',
    htmlContent: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1A161D; color: #E0D8E8; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width: 48px; height: 48px; background: rgba(97, 46, 192, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="font-size: 24px;">🛡️</span>
          </div>
        </div>
        <h1 style="font-family: 'Space Grotesk', sans-serif; color: #F0ECF4; text-align: center; margin-bottom: 16px;">
          Welcome to Integrity Engine, ${fullName}!
        </h1>
        <p style="color: #A89BB5; text-align: center; margin-bottom: 24px;">
          Your ${role} account is ready. Integrity Engine uses AI-powered keystroke dynamics and stylometric fingerprinting to maintain academic integrity.
        </p>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:9002'}/auth/login"
             style="display: inline-block; padding: 12px 32px; background: #612EC0; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Sign In
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Template: Quiz Assignment Notification ─────────────────────────────────

export async function sendQuizAssignedEmail(
  email: string,
  studentName: string,
  quizTitle: string,
  dueDate: string | null
) {
  const dueLine = dueDate
    ? `<p style="color: #A89BB5;">Due date: <strong style="color: #F0ECF4;">${new Date(dueDate).toLocaleDateString()}</strong></p>`
    : '';

  return sendEmail({
    to: [{ email, name: studentName }],
    subject: `New Quiz Assigned: ${quizTitle}`,
    htmlContent: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1A161D; color: #E0D8E8; border-radius: 12px;">
        <h1 style="font-family: 'Space Grotesk', sans-serif; color: #F0ECF4; text-align: center;">
          New Quiz Assigned
        </h1>
        <p style="color: #A89BB5; text-align: center;">
          Hi ${studentName}, you have been assigned a new quiz:
        </p>
        <div style="background: rgba(97, 46, 192, 0.1); border: 1px solid rgba(97, 46, 192, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
          <h2 style="color: #F0ECF4; margin: 0 0 8px;">${quizTitle}</h2>
          ${dueLine}
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:9002'}/student"
             style="display: inline-block; padding: 12px 32px; background: #612EC0; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Start Quiz
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Template: Risk Alert for Teacher ───────────────────────────────────────

export async function sendRiskAlertEmail(
  email: string,
  teacherName: string,
  studentName: string,
  quizTitle: string,
  riskScore: number
) {
  const riskColor = riskScore >= 76 ? '#EF4444' : riskScore >= 56 ? '#F97316' : '#EAB308';

  return sendEmail({
    to: [{ email, name: teacherName }],
    subject: `⚠️ Integrity Alert: ${studentName} — ${quizTitle} (${riskScore}%)`,
    htmlContent: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1A161D; color: #E0D8E8; border-radius: 12px;">
        <h1 style="font-family: 'Space Grotesk', sans-serif; color: #F0ECF4; text-align: center;">
          Integrity Alert
        </h1>
        <p style="color: #A89BB5; text-align: center;">
          A submission has been flagged with a high risk score.
        </p>
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Student:</strong> ${studentName}</p>
          <p style="margin: 4px 0;"><strong>Quiz:</strong> ${quizTitle}</p>
          <p style="margin: 4px 0;"><strong>Risk Score:</strong> <span style="color: ${riskColor}; font-size: 1.2em; font-weight: 700;">${riskScore}%</span></p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:9002'}/teacher"
             style="display: inline-block; padding: 12px 32px; background: #612EC0; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Dashboard
          </a>
        </div>
      </div>
    `,
  });
}
