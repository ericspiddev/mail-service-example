import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // may not be needed though I recommend it
import nodemailer from "nodemailer"

const app = express(); // create our backend application
app.use(cors()); // again may not be needed
dotenv.config() // Init the dotenv package
const port = process.env.PORT || 5050; // Check for a port env variable or default to 5050

app.get('/api/send-mail', (req, res) => { // setup an api endpoint at "/api/send-mail" (we'll use this in the browser)
    let responseHtml = ""
    const sent = sendMailWrapper()
    .then(info => {
        console.log("Sent mail with response: ", info.response)
        responseHtml = "<h1> Succesfully sent email check your inbox! </h1>"
    })
    .catch(error => {
        console.error("Failed to send email with message ", error)
        responseHtml = "<h1> Something went wrong it doesn't appear like we could send the email </h1>"
    })
    .finally(() => {
        res.send(responseHtml);
    })
});

app.listen(port, () => { // Tell the application to listen on the port we specified above
    console.log("Listening on port ", port)
})


async function sendMailWrapper() {
    const mailer = setupNodeMailer();
    if (mailer != null) {
        return await sendMail(mailer);
    }
    throw new Error("No email sender was created")
}

/***
* Function to create a nodeMailer instance we can use to send emails
* returns: Nodemailer instance or null if an error occurs
***/
function setupNodeMailer() {
    const host = process.env.MAIL_HOST
    const mailPort = process.env.MAIL_PORT
    const user = process.env.MAIL_USER
    const password = process.env.MAIL_PASSWORD

    if (host === undefined) { // These could be moved into a validation function but for simplicity kept here
        console.error("Setup failed : undefined mail host")
        return null;
    }
    else if (user === undefined) {
        console.error("Setup failed : undefined mail user")
        return null;
    }
    else if (password === undefined ) {
        console.error("Setup failed : undefined mail password")
        return null;
    }

    return nodemailer.createTransport({
        host: host,
        port: mailPort || 587, // sane default port if one is not provided
        secure: mailPort == 456, // secure port uses 456 so if we aren't that set to false
        auth : {
            user: user,
            pass: password,
        }
    });
}

/***
* Function to send an email using a nodemailer instance
* returns: throws an error if we can't process the mail
***/
async function sendMail(emailSender) {
    const sendTo = process.env.MAIL_SEND_TO
    if ( emailSender == null ) {
        console.error("No email sender can't send email");
        throw new Error("No email sender was created")
    }
    else if (sendTo === undefined) {
        console.error("No where to send the mail cannot send!");
        throw new Error("No sender provided for the email")
    }

    return await emailSender.sendMail({
        from: "'You've Got Mail Tutorial' <" + process.env.MAIL_USER + ">",
        to: sendTo,
        subject: `Express Backend has reached out with a message!`,
        text: "If you're reading this from your email host then the tutorial worked!"
    });
}
