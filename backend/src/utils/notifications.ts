import nodemailer from 'nodemailer';
import axios from 'axios';
import { ExamCheckResult } from '../types';

// Lazy initialization - get transporter when needed
function getEmailTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

function getFromEmail() {
  return process.env.EMAIL_USER || 'noreply@qalaqichecker.com';
}

export async function sendEmailNotification(
  to: string,
  result: ExamCheckResult
): Promise<boolean> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn('Email not configured. Email not sent.');
    return false;
  }

  const FROM_EMAIL = getFromEmail();

  try {
    const info = await transporter.sendMail({
      from: `"QalaqiChecker" <${FROM_EMAIL}>`,
      to: to,
      subject: '📅 ახალი გამოცდა ხელმისაწვდომია!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px;">🎉 გამოცდა ხელმისაწვდომია!</h1>
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><strong>კატეგორია:</strong> ${result.category}</p>
              <p style="margin: 10px 0;"><strong>ცენტრი:</strong> ${result.center}</p>
              <p style="margin: 10px 0;"><strong>თარიღი:</strong> ${result.date}</p>
            </div>
            <p style="color: #666;">გადადით ოფიციალურ პორტალზე ჩაწერისთვის:</p>
            <a href="https://my.gov.ge" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              my.gov.ge-ზე გადასვლა
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              ეს შეტყობინება გამოგზავნილია QalaqiChecker-ის მიერ
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendTelegramNotification(
  chatId: string,
  result: ExamCheckResult
): Promise<boolean> {
  const TELEGRAM_BOT_TOKEN = getTelegramBotToken();
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured. Message not sent.');
    return false;
  }

  try {
    const message = `
🎉 *ახალი გამოცდა ხელმისაწვდომია!*

📋 *კატეგორია:* ${result.category}
🏢 *ცენტრი:* ${result.center}
📅 *თარიღი:* ${result.date}

დააჭირეთ ქვემოთ მოცემულ ბმულს ჩაწერისთვის:
👉 https://my.gov.ge
    `.trim();

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }
    );

    console.log('✅ Telegram message sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export async function sendConfirmationEmail(
  to: string,
  userDetails: {
    categoryName: string;
    centerName: string;
  }
): Promise<boolean> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn('Email not configured. Confirmation email not sent.');
    return false;
  }

  const FROM_EMAIL = getFromEmail();

  try {
    await transporter.sendMail({
      from: `"QalaqiChecker" <${FROM_EMAIL}>`,
      to: to,
      subject: '✅ თქვენ წარმატებით გამოიწერეთ შეტყობინებები!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #16a34a; margin-bottom: 20px;">✅ გამოწერა წარმატებულია!</h1>

            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              გმადლობთ, რომ გამოიწერეთ QalaqiChecker-ის შეტყობინებები!
            </p>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 10px 0; color: #333;"><strong>კატეგორია:</strong> ${userDetails.categoryName}</p>
              <p style="margin: 10px 0; color: #333;"><strong>ცენტრი:</strong> ${userDetails.centerName}</p>
            </div>

            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin-top: 0; font-size: 18px;">📬 რას მივიღებთ?</h2>
              <ul style="color: #555; line-height: 1.8;">
                <li>ჩვენ ავტომატურად ვამოწმებთ გამოცდის ხელმისაწვდომობას <strong>ყოველ 15 წუთში</strong></li>
                <li>როდესაც გამოცდა გამოჩნდება, <strong>დაუყოვნებლივ მიიღებთ ელ-ფოსტას</strong></li>
                <li>შეტყობინება მოიცავს თარიღს და პირდაპირ ბმულს my.gov.ge-ზე</li>
              </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💡 რჩევა:</strong> შეინახეთ ეს ელ-ფოსტა და არ გამორთოთ შეტყობინებები, რომ არ გამოტოვოთ გამოცდა!
              </p>
            </div>

            <p style="color: #666; margin-top: 20px;">
              თუ გსურთ შეწყვიტოთ შეტყობინებების მიღება, შეგიძლიათ ნებისმიერ დროს გააუქმოთ გამოწერა.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              ეს შეტყობინება გამოგზავნილია <strong>QalaqiChecker</strong>-ის მიერ<br>
              ჩვენ ვეხმარებით მძღოლებს სწრაფად მოიძიონ გამოცდის ადგილები
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Confirmation email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

export async function sendConfirmationTelegram(
  chatId: string,
  userDetails: {
    categoryName: string;
    centerName: string;
  }
): Promise<boolean> {
  const TELEGRAM_BOT_TOKEN = getTelegramBotToken();
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured. Confirmation not sent.');
    return false;
  }

  try {
    const message = `
✅ *გამოწერა წარმატებულია!*

გმადლობთ, რომ გამოიწერეთ QalaqiChecker-ის შეტყობინებები!

📋 *კატეგორია:* ${userDetails.categoryName}
🏢 *ცენტრი:* ${userDetails.centerName}

📬 *რას მივიღებთ?*
• ავტომატური შემოწმება ყოველ 15 წუთში
• დაუყოვნებელი შეტყობინება როცა გამოცდა გამოჩნდება
• პირდაპირ ბმული my.gov.ge-ზე ჩაწერისთვის

💡 *რჩევა:* არ გამორთოთ შეტყობინებები, რომ არ გამოტოვოთ გამოცდა!

---
🚗 *QalaqiChecker* - ვეხმარებით მძღოლებს სწრაფად მოიძიონ გამოცდის ადგილები
    `.trim();

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }
    );

    console.log('✅ Telegram confirmation sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram confirmation:', error);
    return false;
  }
}

export async function notifyUser(
  email: string | undefined,
  telegramChatId: string | undefined,
  result: ExamCheckResult
): Promise<void> {
  const promises: Promise<boolean>[] = [];

  if (email) {
    promises.push(sendEmailNotification(email, result));
  }

  if (telegramChatId) {
    promises.push(sendTelegramNotification(telegramChatId, result));
  }

  await Promise.allSettled(promises);
}
