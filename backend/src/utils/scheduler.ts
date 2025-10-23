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

        if (result.available) {
          // Check if this is a NEW exam date (different from what we notified about before)
          const isNewExamDate = !user.notifiedDate || user.notifiedDate !== result.date;

          if (isNewExamDate) {
            console.log(`✅ ${user.notified ? 'NEW' : 'First'} exam found for ${user.personalNumber}! Date: ${result.date}`);
            console.log(`   Sending notification...`);

            await notifyUser(user.email, user.telegramChatId, result);

            await db.updateUser(user.id, {
              notified: true,
              notifiedDate: result.date,
              notifiedAt: new Date().toISOString(),
            });

            console.log(`📧 Notification sent to user ${user.personalNumber}`);
          } else {
            console.log(`Already notified about exam on ${result.date} for ${user.personalNumber}, skipping...`);
          }
        } else {
          console.log(`❌ No exam available for ${user.personalNumber}`);

          // If exam was previously available but now it's not, reset notification flag
          // This allows re-notification if a new exam appears later
          if (user.notified) {
            console.log(`   Previous exam (${user.notifiedDate}) no longer available, resetting notification flag`);
            await db.updateUser(user.id, {
              notified: false,
              notifiedDate: undefined,
            });
          }
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
