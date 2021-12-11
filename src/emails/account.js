const sgMail = require('@sendgrid/mail')



sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

// const msg = {
//     to: 'nhomreanit.rupp@gmail.com',
//     from: 'admin@khmer-tech.com', // Use the email address or domain you verified above
//     subject: 'Sending with Twilio SendGrid is Fun',
//     text: 'and easy to do anywhere, even with Node.js',
//     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
//
// sgMail
//     .send(msg)
//     .then(() => {
//         console.log('Email sent')
//     })
//     .catch((error) => {
//         console.error(error)
//     })

const sendWelcomeEmail = (email , name) => {
    const msg = {
        to: email,
        from: 'admin@khmer-tech.com', // Use the email address or domain you verified above
        subject: 'Thank for joining in!',
        text: `Welcome to the app, ${name} Let me know how you get along with the app.`,
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail
        .send(msg) // don't need await for app running faster
        // .then(() => {
        //     console.log('Email sent')
        // })
        // .catch((error) => {
        //     console.error(error)
        // })
}

const sendCancelEmail = (email,name) => {
    const msg = {
        to: email,
        from: 'admin@khmer-tech.com', // Use the email address or domain you verified above
        subject: 'So sad to see you go!',
        text: `Hey, ${name} why you leaving me mfk.`,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail
        .send(msg)
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
};