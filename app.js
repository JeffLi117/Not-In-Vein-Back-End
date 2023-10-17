const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
require('dotenv').config();
const brevo = require('@getbrevo/brevo');
// delete this before pushing it
const serviceAccount = require('./not-in-vein-firebase-adminsdk-6wc6q-5db000729a.json');

const app = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

const sgMail = require('@sendgrid/mail');
const apiKey = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(apiKey);
const msg = {
    to: '',
    from: 'tomomi.n.kosaka@gmail.com', // Use the email address or domain you verified above
    subject: 'Sending with Twilio SendGrid is Fun by Tomomi for Test',
    text: 'this is test to see if SendGrid is working',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };



// let defaultClient = brevo.ApiClient.instance;

// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = process.env.API_KEY;

// let partnerKey = defaultClient.authentications['partner-key'];
// partnerKey.apiKey = process.env.API_KEY;

// let apiInstance = new brevo.TransactionalEmailsApi();
// let sendSmtpEmail = new brevo.SendSmtpEmail();

// sendSmtpEmail.subject = "My {{params.subject}}";
// sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email {{params.parameter}}</h1></body></html>";
// sendSmtpEmail.sender = { "name": "Jeffrey Li - Not In Vein", "email": "jeffrey.t.li.work@gmail.com" };
// sendSmtpEmail.to = [
//   { "email": "{{params.EMAIL}}", "name": "{{params.FULLNAME}}" }
// ];
// sendSmtpEmail.replyTo = { "email": "example@brevo.com", "name": "sample-name" };
// sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
// sendSmtpEmail.params = { "parameter": "TESTING", "subject": "Testing subject" };

const testFunction = async () => {
    const userRef = db.collection('users').doc('0cse2xite0MLhgYks2K8dJp4XK32');
    const doc = await userRef.get();
    if (!doc.exists) {
        console.log('No such document!');
    } else {
        // console.log('Document data:', doc.data());
        // console.log(sendSmtpEmail.params);
        // sendSmtpEmail.params['EMAIL'] = doc.data().email;
        // sendSmtpEmail.params['FULLNAME'] = doc.data().name;
        // console.log(`sendSmtpEmail:`, sendSmtpEmail);
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

testFunction();




  //ES6

  

// testFunction()
//     .then(() => {
//         console.log(sendSmtpEmail.params);
//         // send the info
//         apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
//             console.log('API called successfully. Returned data: ' + JSON.stringify(data));
//         }, function (error) {
//             console.error(error);
//         });
//     })