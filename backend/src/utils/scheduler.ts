import cron from 'node-cron';
import { db } from './database';
import { checkUserExam } from './checkAvailability';
import { notifyUser } from './notifications';

const CHECK_INTERVAL = process.env.CHECK_INTERVAL_MINUTES || '15';
let isChecking = false;

export function startScheduler() {
  console.log(`🕐 Starting scheduler: checking every ${CHECK_INTERVAL} minutes`);

  // Run every N minutes
  cron.schedule(`*/${CHECK_INTERVAL} * * * *`, async () => {
    if (isChecking) {
      console.log('Previous check still running, skipping...');
      return;
    }

    isChecking = true;
    await checkAllUsers();
    isChecking = false;
  });

  // Also run once on startup after 30 seconds
  setTimeout(() => {
    checkAllUsers();
  }, 30000);
}

async function checkAllUsers() {
  try {
    const users = await db.getUsers();

    if (users.length === 0) {
      console.log('No users to check');
      return;
    }

    console.log(`\n🔍 Checking ${users.length} user(s) for exam availability...`);

    for (const user of users) {
      try {
        console.log(`Checking user: ${user.personalNumber} (${user.categoryName})`);

        const result = await checkUserExam(user);

        await db.updateUser(user.id, {
          lastChecked: new Date().toISOString(),
        });

        if (result.available && !user.notified) {
          console.log(`✅ Exam found for ${user.personalNumber}! Sending notification...`);

          await notifyUser(user.email, user.telegramChatId, result);

          await db.updateUser(user.id, {
            notified: true,
          });

          console.log(`📧 Notification sent to user ${user.personalNumber}`);
        } else if (result.available && user.notified) {
          console.log(`Already notified user ${user.personalNumber}, skipping...`);
        } else {
          console.log(`❌ No exam available for ${user.personalNumber}`);
        }

        // Small delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error checking user ${user.personalNumber}:`, error);
      }
    }

    console.log('✅ Check complete\n');
  } catch (error) {
    console.error('Error in checkAllUsers:', error);
  }
}

// Manual trigger for testing
export async function triggerManualCheck() {
  if (isChecking) {
    return { message: 'Check already in progress' };
  }

  isChecking = true;
  await checkAllUsers();
  isChecking = false;

  return { message: 'Manual check completed' };
}
