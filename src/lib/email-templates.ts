import type { Email } from "./email";

/** Escape text before putting it into HTML email bodies. */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function layout(heading: string, body: string, buttonText: string, url: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#1f2328">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border:1px solid #dcd9d0;border-radius:10px;padding:28px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2f6f4f;font-weight:bold">PyTrek</p>
    <h1 style="margin:0 0 16px;font-size:20px">${esc(heading)}</h1>
    ${body}
    <p style="margin:24px 0">
      <a href="${esc(url)}" style="background:#2f6f4f;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">${esc(buttonText)}</a>
    </p>
    <p style="margin:0;font-size:12px;color:#5f6670">If the button doesn't work, copy this link into your browser:<br>${esc(url)}</p>
  </div>
</body></html>`;
}

export function verificationEmail(to: string, name: string, url: string): Email {
  return {
    to,
    subject: "Confirm your PyTrek email",
    text: `Hi ${name},\n\nConfirm your email to start using PyTrek:\n${url}\n\nIf you didn't create a PyTrek account, you can ignore this email.`,
    html: layout(
      `Welcome, ${name}!`,
      `<p style="margin:0">Confirm your email address to start using PyTrek.</p>
       <p style="margin:12px 0 0;font-size:13px;color:#5f6670">If you didn't create a PyTrek account, you can ignore this email.</p>`,
      "Confirm my email",
      url,
    ),
  };
}

export function resetPasswordEmail(to: string, name: string, url: string): Email {
  return {
    to,
    subject: "Reset your PyTrek password",
    text: `Hi ${name},\n\nReset your PyTrek password here (the link expires in 1 hour):\n${url}\n\nIf you didn't ask to reset your password, you can ignore this email.`,
    html: layout(
      "Reset your password",
      `<p style="margin:0">Hi ${esc(name)}, use the button below to choose a new password. The link expires in 1 hour.</p>
       <p style="margin:12px 0 0;font-size:13px;color:#5f6670">If you didn't ask to reset your password, you can ignore this email. Resetting signs you out on every device.</p>`,
      "Choose a new password",
      url,
    ),
  };
}
