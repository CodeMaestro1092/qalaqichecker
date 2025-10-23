import { Resend } from 'resend';
import axios from 'axios';
import { ExamCheckResult } from '../types';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmailNotification(
  to: string,
  result: ExamCheckResult
): Promise<boolean> {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
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

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
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

    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }
    );

    console.log('Telegram message sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
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
