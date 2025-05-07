const schedule = require('node-schedule');
const checkAndSendReminders = require('./emailReminder');

schedule.scheduleJob('0 8 * * *', async () => {
    console.log('🔔 Running daily item reminder check at 8:00 AM');
    await checkAndSendReminders();
});