require("dotenv").config();
const puppeteer = require("puppeteer");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

(async () => {
  const URL = "https://www.amazon.in/gp/product/B07PLTG2S5/";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  await page.waitFor(2000);

  try {
    const priceString = await page.evaluate(() => {
      return document.getElementById("priceblock_ourprice").innerHTML;
    });
    const price = priceString.replace("₹&nbsp;", "");
    const minPrice = 300;
    console.log(price);

    function sendMail(body) {
      const mail = {
        to: process.env.TO_EMAIL,
        from: process.env.FROM_EMAIL, // Use the email address or domain you verified above
        subject: "Price alert",
        text: body,
        html: body,
      };

      return sgMail.send(mail); // We are returning because the method returns a promise which needs to be awaited
    }

    if (price < minPrice) {
      await sendMail(
        `Price of the product on ${URL} has droppped below Rs ${minPrice}`
      );
      console.log("Mail sent");
    } else {
      console.log(`Price higher than ${minPrice}`);
    }
  } catch (e) {
    await sendMail("The program could not access Amazon.");
    throw e;
  }

  await browser.close();
})();
