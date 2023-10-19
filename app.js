const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
var isFuture = require('date-fns/isFuture');
var differenceInCalendarDays = require('date-fns/differenceInCalendarDays');
var cron = require('node-cron');

require('dotenv').config();

const app = initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const db = getFirestore();

const sgMail = require('@sendgrid/mail');
const apiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);
const msg = {
    to: '',
    from: 'not.in.vein.email@gmail.com', // Use the email address or domain you verified above
    subject: 'Upcoming donation appointment reminder',
    text: 'This is a reminder for appointments 7 days away',
    html: '<div><strong>Hello there!</strong><p>This is a reminder that your scheduled appointment is in a week.</p></div>',
};

const testFunction = async (theUpcomingDate) => {
    const userRef = db.collection('users').doc('0cse2xite0MLhgYks2K8dJp4XK32');
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        msg.to = doc.data().email;
        msg.html = `<div><strong>Hello there!</strong><p>This is a reminder that your scheduled appointment is in a week on ${theUpcomingDate}</p></div>`
        console.log(msg);
        sgMail
            .send(msg)
            .then(() => {}, error => {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            });  
    }
}

const manyDaysAway = async (numberOfDays, retrievedEmail) => {
    if (!retrievedEmail) {
        console.log('No email given/found!');
    } else {
        msg.to = retrievedEmail;
        msg.html = `<div><strong>Hello there!</strong><p>This is a reminder that your scheduled appointment is ${numberOfDays} days away.</p></div>`
        console.log(msg);
        sgMail
            .send(msg)
            .then(() => {}, error => {
                console.error(error);

                if (error.response) {
                    console.error(error.response.body)
                }
            });  
    }
}

const howManyDaysAway = (upcomingDate, todayDate) => {
    return differenceInCalendarDays(upcomingDate, todayDate)
}

const sendUpcomingReminder = async () => {
    const userRef = db.collection('users').doc('0cse2xite0MLhgYks2K8dJp4XK32');
    const doc = await userRef.get();
    const today = new Date();
    let userEmail;
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        userEmail = doc.data().email;
        const convertedDate = doc.data().upcomingDonation.toDate();
        // if (isFuture(convertedDate) && isSevenAway(convertedDate, today)) {
        //     testFunction(convertedDate);
        // } else 
        if (isFuture(convertedDate)) {
            let number = howManyDaysAway(convertedDate, today);
            manyDaysAway(number, userEmail);
        }
    }
}

const isSevenAway = (upcomingDate, todayDate) => {
    if (differenceInCalendarDays(upcomingDate, todayDate) == 7) {
        return true
    } 
}

// sendUpcomingReminder();

// cron.schedule('* */1 * * *', () => {
//     console.log('running a task every 1 hour');
//     sendUpcomingReminder();
// });

cron.schedule('0 10 * * *', () => {
    console.log('Running a job at 10:00 at America/Sao_Paulo timezone (which should be 08:00 CST)');
    sendUpcomingReminder();
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo"
});

// testFunction();