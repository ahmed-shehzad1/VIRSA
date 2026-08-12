const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    // No SMTP configured (common in early local dev) - fall back to a
    // transport that just logs to the console instead of crashing.
    transporter = {
      sendMail: async (opts) => {
        console.warn('[email.service] SMTP not configured. Would have sent:', {
          to: opts.to,
          subject: opts.subject,
        });
        console.warn('[email.service] Preview link/body:', opts.text || opts.html);
        return { messageId: 'dev-noop' };
      },
    };
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  return t.sendMail({ from: config.smtp.from, to, subject, html, text });
}

async function sendVerificationEmail(toEmail, rawToken) {
  const link = `${config.clientUrl}/verify-email?token=${rawToken}`;
  return sendMail({
    to: toEmail,
    subject: 'Verify your Virsa account',
    html: `<p>Welcome to Virsa! Click the link below to verify your email address.</p>
           <p><a href="${link}">Verify my email</a></p>
           <p>This link expires in ${config.tokens.emailVerificationExpiresInMin} minutes.</p>`,
    text: `Verify your email: ${link}`,
  });
}

async function sendPasswordResetEmail(toEmail, rawToken) {
  const link = `${config.clientUrl}/reset-password?token=${rawToken}`;
  return sendMail({
    to: toEmail,
    subject: 'Reset your Virsa password',
    html: `<p>We received a request to reset your password.</p>
           <p><a href="${link}">Reset my password</a></p>
           <p>This link expires in ${config.tokens.passwordResetExpiresInMin} minutes.
           If you didn't request this, you can safely ignore this email.</p>`,
    text: `Reset your password: ${link}`,
  });
}

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
