require('dotenv').config({ path: './.env.local' });
const checkAndSendReminders = require('./services/emailReminder');

const runRemindersNow = async () => {
    console.log('🔔 Running item reminder check immediately');
    await checkAndSendReminders();
};

runRemindersNow();