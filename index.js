"use strict";
const nodemailer = require("nodemailer");

const sendEmail = (mailOptions) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error sending email", error);
        reject(error);
      } else {
        console.log(`Email sent to: ${email} - ${info.response}`);
        resolve("Email sent");
      }
    });
  });
};

exports.handler = async (event) => {
  return new Promise(async (resolve, reject) => {
    switch (event.httpMethod) {
      case "POST":
        const buff = new Buffer(event.body, "base64");
        const inputData = buff.toString("ascii");

        const { emailFrom, emailTo, emailSubject, emailBodyHtml } = JSON.parse(
          inputData
        );

        sendEmail({
          from: emailFrom,
          to: emailTo,
          subject: emailSubject,
          html: emailBodyHtml,
        })
          .then((res) => {
            done(null, res);
          })
          .catch((err) => {
            done(err, null);
          });

        break;
      default:
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }

    const done = (err, res) => {
      const response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: "",
      };
      if (!err) {
        response.body = JSON.stringify(res);
        resolve(response);
      } else {
        response.body = JSON.stringify(err.message);
        response.statusCode = 400;
        reject(response);
      }
    };
  });
};
