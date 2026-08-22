import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, company, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Gerekli alanları doldurunuz (Ad, E-Posta, Mesaj)' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, 
      replyTo: email,
      subject: `[OctopusAPM İletişim Formu] ${subject || 'Yeni Mesaj'}`,
      text: `
Ad Soyad: ${name}
Şirket: ${company || 'Belirtilmedi'}
E-Posta: ${email}
Konu: ${subject || 'Belirtilmedi'}

Mesaj:
${message}
      `,
      html: `
        <h3>OctopusAPM İletişim Formundan Yeni Mesaj</h3>
        <p><strong>Ad Soyad:</strong> ${name}</p>
        <p><strong>Şirket:</strong> ${company || 'Belirtilmedi'}</p>
        <p><strong>E-Posta:</strong> ${email}</p>
        <p><strong>Konu:</strong> ${subject || 'Belirtilmedi'}</p>
        <hr />
        <p><strong>Mesaj:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Mesajınız başarıyla gönderildi.' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
}
