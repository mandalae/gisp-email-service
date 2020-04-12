"use strict";
const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-1",
});

const sendEmail = (mailOptions) => {
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const params = {
    Destination: {
      ToAddresses: ["theminddepth@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: mailOptions.text,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: mailOptions.subject,
      },
    },
    Source: "hello@gisp.org.uk",
  };

  console.log("About to send email, mailOptions:", mailOptions);

  return ses
    .sendEmail(params)
    .promise()
    .then((data) => {
      console.log("Email submitted to SES, data:", data);
    });
};

exports.handler = async (event) => {
  return new Promise(async (resolve, reject) => {
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

    switch (event.httpMethod) {
      case "POST":
        const buff = new Buffer(event.body, "base64");
        const inputData = buff.toString("ascii");

        const { emailSubject, emailText } = JSON.parse(inputData);

        sendEmail({
          subject: emailSubject,
          text: emailText,
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
  });
};
