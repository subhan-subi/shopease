import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import SystemSetting from "../models/SystemSetting.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

export const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  });
};

export const maskEmailAddress = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) return "Not configured";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return local[0] + "*@" + domain;
  return local[0] + "*".repeat(Math.min(local.length - 2, 5)) + local[local.length - 1] + "@" + domain;
};

export const getEffectiveSender = async () => {
  try {
    if (mongoose.connection?.readyState === 1) {
      const setting = await SystemSetting.findOne({ key: "email" }).lean();
      if (setting && setting.senderEmail) {
        const name = setting.senderName || process.env.EMAIL_FROM_NAME || "ShopEase";
        return {
          senderEmail: setting.senderEmail,
          senderName: name,
          replyToEmail: setting.replyToEmail || "",
          fromHeader: `"${name}" <${setting.senderEmail}>`,
          isCustom: true,
        };
      }
    }
  } catch (err) {
    console.error("[EMAIL SERVICE] Error loading SystemSetting:", err.message);
  }
  const envName = process.env.EMAIL_FROM_NAME || "ShopEase";
  const envUser = process.env.EMAIL_USER || process.env.SMTP_USER || "no-reply@shopease.com";
  const envFrom = process.env.EMAIL_FROM || `"${envName}" <${envUser}>`;
  return { senderEmail: envUser, senderName: envName, replyToEmail: "", fromHeader: envFrom, isCustom: false };
};

export const getSmtpStatus = async () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
  const isConfigured = Boolean(user && pass);
  const effectiveSender = await getEffectiveSender();
  let provider = "Custom SMTP";
  if (host.includes("gmail")) provider = "Google Workspace / Gmail SMTP";
  else if (host.includes("sendgrid")) provider = "SendGrid";
  else if (host.includes("mailgun")) provider = "Mailgun";
  else if (host.includes("ses")) provider = "Amazon SES";
  return {
    isConfigured, provider, host, port,
    maskedAuthUser: maskEmailAddress(user),
    effectiveSenderEmail: effectiveSender.senderEmail,
    effectiveSenderName: effectiveSender.senderName,
    replyToEmail: effectiveSender.replyToEmail,
    isCustomSender: effectiveSender.isCustom,
  };
};

export const sendEmail = async ({ to, subject, html, text, from, replyTo }) => {
  const transporter = createTransporter();
  if (!transporter) return {
    success: false, delivered: false,
    errorCode: "EMAIL_SERVICE_NOT_CONFIGURED",
    message: "Email service not configured. Set EMAIL_USER and EMAIL_PASSWORD in server environment.",
  };
  const senderInfo = await getEffectiveSender();
  const effectiveFrom = from || senderInfo.fromHeader;
  const effectiveReplyTo = replyTo || senderInfo.replyToEmail || undefined;
  try {
    const info = await transporter.sendMail({ from: effectiveFrom, to, subject, text, html, replyTo: effectiveReplyTo });
    return { success: true, delivered: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
  } catch (error) {
    console.error(`[EMAIL SERVICE ERROR] Failed sending to ${to}:`, error.message);
    let errorCode = "EMAIL_SEND_FAILED";
    let userMessage = "Failed to send email via SMTP provider.";
    if (error.code === "EAUTH" || (error.message && error.message.toLowerCase().includes("invalid login"))) {
      errorCode = "SMTP_AUTH_FAILED"; userMessage = "SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASSWORD.";
    } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      errorCode = "SMTP_CONNECTION_FAILED"; userMessage = "Could not connect to SMTP server. Verify EMAIL_HOST and EMAIL_PORT.";
    } else if (error.responseCode === 550 || error.responseCode === 553) {
      errorCode = "RECIPIENT_REJECTED"; userMessage = `Recipient email rejected by mail server: ${to}`;
    }
    return { success: false, delivered: false, errorCode, message: userMessage, errorDetail: error.message };
  }
};

export const sendPasswordResetEmail = async ({ to, resetUrl, userName = "Valued Customer" }) => {
  const senderInfo = await getEffectiveSender();
  const subject = "Reset your ShopEase Password";
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Reset Your ShopEase Password</title>
<style>body{margin:0;padding:0;font-family:sans-serif;background:#f4f6f8}.container{max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb}.header{background:linear-gradient(135deg,#ff6b00,#e05e00);padding:28px 24px;text-align:center;color:#fff}.content{padding:36px 32px}.footer{background:#f9fafb;padding:20px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style>
</head>
<body><div class="container">
<div class="header"><h1 style="margin:0;font-size:26px;font-weight:800">${senderInfo.senderName || "ShopEase"}</h1><p style="margin:6px 0 0;font-size:14px;opacity:.9">Security &amp; Account Protection</p></div>
<div class="content">
<p style="font-size:18px;font-weight:700;color:#111827">Hello ${userName},</p>
<p style="font-size:15px;line-height:1.6;color:#4b5563">We received a request to reset your <strong>ShopEase</strong> password. Click the button below:</p>
<div style="text-align:center;margin:32px 0"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b00,#e05e00);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:50px">Reset Password</a></div>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:8px;font-size:13px;color:#92400e"><strong>Security Notice:</strong> This link expires in <strong>15 minutes</strong>. If you did not request this, ignore this email.</div>
<p style="font-size:12px;color:#6b7280;margin-top:16px;word-break:break-all">${resetUrl}</p>
</div>
<div class="footer">&copy; ${new Date().getFullYear()} ShopEase. Do not reply to this email.</div>
</div></body></html>`;
  const text = `Hello ${userName},\n\nReset your ShopEase password (valid 15 min):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.\n\n- The ${senderInfo.senderName || "ShopEase"} Team`;
  return sendEmail({ to, subject, html, text });
};

export const sendAdminEmailChangeVerification = async ({ to, verifyUrl, adminName = "Admin" }) => {
  const senderInfo = await getEffectiveSender();
  const subject = "Verify your new ShopEase Admin email address";
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Verify New Admin Email - ShopEase</title>
<style>body{margin:0;padding:0;font-family:sans-serif;background:#f4f6f8}.container{max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb}.header{background:linear-gradient(135deg,#ff6b00,#e05e00);padding:28px 24px;text-align:center;color:#fff}.content{padding:36px 32px}.footer{background:#f9fafb;padding:20px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style>
</head>
<body><div class="container">
<div class="header"><h1 style="margin:0;font-size:26px;font-weight:800">${senderInfo.senderName || "ShopEase"}</h1><p style="margin:6px 0 0;font-size:14px;opacity:.9">Admin Account Security</p></div>
<div class="content">
<p style="font-size:18px;font-weight:700;color:#111827">Hello ${adminName},</p>
<p style="font-size:15px;line-height:1.6;color:#4b5563">You requested to change your <strong>ShopEase Admin</strong> login email. Click the button below to verify and activate your new email address:</p>
<div style="text-align:center;margin:32px 0"><a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b00,#e05e00);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:50px">Verify New Email</a></div>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:8px;font-size:13px;color:#92400e"><strong>Security Notice:</strong> Single-use link, expires in <strong>30 minutes</strong>. Your current email stays active until verified. If you did not request this, ignore this email.</div>
<p style="font-size:12px;color:#6b7280;margin-top:16px;word-break:break-all">${verifyUrl}</p>
</div>
<div class="footer">&copy; ${new Date().getFullYear()} ShopEase. Automated security message.</div>
</div></body></html>`;
  const text = `Hello ${adminName},\n\nVerify your new ShopEase Admin email (valid 30 min):\n\n${verifyUrl}\n\nYour current email remains active until verified.\nIf you did not request this, ignore this email.\n\n- The ${senderInfo.senderName || "ShopEase"} Team`;
  return sendEmail({ to, subject, html, text });
};

export const sendTestEmail = async ({ to }) => {
  const senderInfo = await getEffectiveSender();
  const subject = "[ShopEase] SMTP Connection Test Email";
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>ShopEase Test Email</title>
<style>body{font-family:sans-serif;background:#f4f6f8;margin:0;padding:20px}.card{max-width:520px;margin:20px auto;background:#fff;padding:30px;border-radius:12px;border:1px solid #e5e7eb}</style>
</head>
<body><div class="card">
<span style="display:inline-block;background:#10b981;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">SMTP Verified</span>
<h2 style="color:#111827;margin:16px 0 8px">SMTP Configuration Test Successful!</h2>
<p style="color:#4b5563;font-size:14px;line-height:1.6">Your ShopEase SMTP service is connected and working correctly.</p>
<div style="background:#f9fafb;padding:12px;border-radius:8px;font-size:13px;color:#374151;margin:20px 0">
  <div><strong>Sender Name:</strong> ${senderInfo.senderName}</div>
  <div><strong>Sender Email:</strong> ${senderInfo.senderEmail}</div>
  <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
</div>
<p style="color:#9ca3af;font-size:12px;margin:0">&copy; ${new Date().getFullYear()} ShopEase Administration.</p>
</div></body></html>`;
  const text = `ShopEase SMTP Test - Email configuration is working!\nTimestamp: ${new Date().toISOString()}`;
  return sendEmail({ to, subject, html, text });
};

export const sendVerificationEmail = async ({ to, verifyUrl, userName = "Valued Customer" }) => {
  const senderInfo = await getEffectiveSender();
  const subject = "Verify your ShopEase account email";
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Verify Your Email - ShopEase</title>
<style>body{margin:0;padding:0;font-family:sans-serif;background:#f4f6f8}.container{max-width:560px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb}.header{background:linear-gradient(135deg,#ff6b00,#e05e00);padding:28px 24px;text-align:center;color:#fff}.content{padding:36px 32px}.footer{background:#f9fafb;padding:20px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style>
</head>
<body><div class="container">
<div class="header"><h1 style="margin:0;font-size:26px;font-weight:800">${senderInfo.senderName || "ShopEase"}</h1><p style="margin:6px 0 0;font-size:14px;opacity:.9">Account Email Verification</p></div>
<div class="content">
<p style="font-size:18px;font-weight:700;color:#111827">Hello ${userName},</p>
<p style="font-size:15px;line-height:1.6;color:#4b5563">Thank you for registering with <strong>ShopEase</strong>. Please verify your email address to activate your account and start shopping:</p>
<div style="text-align:center;margin:32px 0"><a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#ff6b00,#e05e00);color:#fff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 36px;border-radius:50px">Verify Email Address</a></div>
<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:8px;font-size:13px;color:#92400e"><strong>Notice:</strong> This verification link expires in <strong>24 hours</strong>. If you did not create a ShopEase account, you can safely ignore this email.</div>
<p style="font-size:12px;color:#6b7280;margin-top:16px;word-break:break-all">${verifyUrl}</p>
</div>
<div class="footer">&copy; ${new Date().getFullYear()} ShopEase. All rights reserved.</div>
</div></body></html>`;
  const text = `Hello ${userName},\n\nThank you for signing up for ShopEase. Please verify your email address (valid for 24 hours) by visiting:\n\n${verifyUrl}\n\nIf you did not create an account, please ignore this email.\n\n- The ${senderInfo.senderName || "ShopEase"} Team`;
  return sendEmail({ to, subject, html, text });
};

