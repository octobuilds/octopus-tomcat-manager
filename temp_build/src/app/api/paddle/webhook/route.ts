import { NextResponse } from 'next/server';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY || '', {
  environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox' 
    ? Environment.sandbox 
    : Environment.production,
});

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('paddle-signature') || '';
    const rawRequestBody = await req.text();
    const secret = process.env.PADDLE_WEBHOOK_SECRET || '';

    let eventData;
    try {
      // Verify signature
      eventData = await paddle.webhooks.unmarshal(rawRequestBody, secret, signature);
    } catch (err) {
      console.error('Invalid Webhook Signature:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Sadece tamamlanmış satın alımları dinliyoruz
    if (eventData.eventType === 'transaction.completed') {
      const transaction = eventData.data as any;
      const paddleCustomerId = transaction.customerId;

      if (!paddleCustomerId) {
        return NextResponse.json({ message: 'No customer ID in transaction' }, { status: 200 });
      }

      // 1. Paddle API'den müşteri detaylarını (E-posta, İsim) al
      const customer = await paddle.customers.get(paddleCustomerId);
      const email = customer.email;
      const name = customer.name || 'Değerli Müşterimiz';

      // 2. MySQL Veritabanına Bağlan
      if (process.env.DATABASE_URL) {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        try {
          // Müşteri veritabanında var mı?
          const [rows]: any = await connection.execute('SELECT id FROM customers WHERE email = ?', [email]);
          
          let dbCustomerId = null;
          let isNewCustomer = false;
          const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 haneli rastgele şifre

          if (rows.length > 0) {
            dbCustomerId = rows[0].id;
          } else {
            // Yeni Müşteri Ekle
            isNewCustomer = true;
            try {
              const [insertRes]: any = await connection.execute(
                'INSERT INTO customers (email, name, password, paddle_customer_id) VALUES (?, ?, ?, ?)',
                [email, name, generatedPassword, paddleCustomerId]
              );
              dbCustomerId = insertRes.insertId;
            } catch (insertErr) {
              console.warn("Müşteri eklenirken veritabanı şema uyuşmazlığı olabilir:", insertErr);
              // Farklı bir şema varsa en temel alanlarla tekrar dene
              const [insertResBasic]: any = await connection.execute(
                'INSERT INTO customers (email) VALUES (?)',
                [email]
              );
              dbCustomerId = insertResBasic.insertId;
            }
          }

          // Abonelik tablosuna işle
          const subscriptionId = transaction.subscriptionId;
          if (dbCustomerId && subscriptionId) {
            try {
              await connection.execute(
                'INSERT INTO subscriptions (customer_id, paddle_subscription_id, status) VALUES (?, ?, ?)',
                [dbCustomerId, subscriptionId, 'active']
              );
            } catch (subErr) {
              console.warn("Abonelik eklenirken şema uyuşmazlığı olabilir:", subErr);
            }
          }

          // 3. Yeni müşteriyse Şifresini E-posta ile gönder
          if (isNewCustomer && process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT) || 465,
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            await transporter.sendMail({
              from: `"OctopusAPM" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
              to: email,
              subject: 'OctopusAPM Hesabınız Oluşturuldu - Giriş Bilgileriniz',
              html: `
                <h2>OctopusAPM'ye Hoş Geldiniz!</h2>
                <p>Merhaba ${name},</p>
                <p>Ödemeniz başarıyla alındı ve hesabınız oluşturuldu. Aşağıdaki bilgilerle sisteme giriş yapabilirsiniz:</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>E-Posta:</strong> ${email}</p>
                  <p><strong>Şifre:</strong> ${generatedPassword}</p>
                </div>
                <p>Giriş yaptıktan sonra şifrenizi değiştirmenizi öneririz.</p>
                <br/>
                <p>Saygılarımızla,<br/>OctopusAPM Ekibi</p>
              `
            });
          }

        } finally {
          await connection.end();
        }
      }
    }

    // Paddle webhookların tekrarlanmaması için daima 200 dönülmeli
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook işleme hatası:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
