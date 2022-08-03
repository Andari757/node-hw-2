/* eslint-disable no-useless-catch */
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const {SENDGRID_API_KEY} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async(data) => {
    console.log(SENDGRID_API_KEY)
    const mail = {...data, from: "matviyskrypka@gmail.com"};
    try {
        await sgMail.send(mail);
        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = sendMail;