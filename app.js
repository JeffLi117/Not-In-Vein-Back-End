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
    subject: 'Sending with Twilio SendGrid is easy - using new email',
    text: 'this is test to see if SendGrid is working',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

const testFunction = async () => {
    const userRef = db.collection('users').doc('E78EcPxRktbGacyZN4gd65vFCCZ2');
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        msg.to = doc.data().email;
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

const sendUpcomingReminder = async () => {
    const userRef = db.collection('users').doc('E78EcPxRktbGacyZN4gd65vFCCZ2');
    const doc = await userRef.get();
    const today = new Date();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        const convertedDate = doc.data().upcomingDonation.toDate();
        if (isFuture(convertedDate) && isSevenAway(convertedDate, today)) {
            testFunction();
        }
    }
}

const isSevenAway = (upcomingDate, todayDate) => {
    if (differenceInCalendarDays(upcomingDate, todayDate) == 7) {
        return true
    } 
}


cron.schedule('*/1 * * * *', () => {
    console.log('running a task every 1 minute');
    sendUpcomingReminder();
});

// testFunction();