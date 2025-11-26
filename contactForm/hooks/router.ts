/** @format */

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, category, company } = await req.json();

    if (!email || !name || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // 1️⃣ 创建 Office365 SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // 587 = STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });

    // 2️⃣ 发给用户的确认邮件
    await transporter.sendMail({
      from: `"BlueSky Creations" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'We have received your message | BlueSky Creations',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for contacting BlueSky Creations. We have received your message and will get back to you soon.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <p>Warm regards,<br/>BlueSky Creations</p>
      `,
      replyTo: 'info@blueskycreations.com.au',
    });

    // 3️⃣ 发给 info@ 的通知邮件
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: 'info@blueskycreations.com.au',
      subject: `New message from ${name}`,
      html: `
        <p>You have a new enquiry from the website form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p>You can reply directly to this email.</p>
      `,
      replyTo: email, // 领导点"Reply" → 直接回给留言人
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; toString?: () => string };
    console.error('Email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: err.message || err.toString?.() || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
