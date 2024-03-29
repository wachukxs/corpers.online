'use strict';
const nodemailer = require('nodemailer');

// async..await is not allowed in global scope, must use a wrapper
async function main(email, name, state) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'mail.corpers.online',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'hi@corpers.online', // testAccount.user, // generated ethereal user
            pass: 'B3JyZW?4sz.e'// testAccount.pass // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Corpers Online 🇳🇬" <hi@corpers.online>', // sender address
        to: email,// 'bar@example.com, baz@example.com', // list of receivers
        subject: 'Welcome to the Network', // Subject line
        text: 'Hello world?', // plain text body
        html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Welcome to the Network</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin: 0; padding: 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">	
                <tr>
                    <td style="padding: 10px 0 10px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                            <tr>
                                <td align="center" bgcolor="#70bbd9" >
                                    <img src="cid:001@corpers.online" alt="${name}, welcome to corpers.online" style="display: block;width: 100%;height: auto;" />
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
                                                <b>Here's a short introduction!</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                <b>${name}</b>, we're glad you're now online with us. We are psyched about it. And we have some information for you. So you'd know what Corpers Online is really about.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td width="260" valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                <tr>
                                                                    <td>
                                                                        <img src="cid:002@corpers.online" alt="" width="100%" height="140" style="display: block;" />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                        <ul>
                                                                            <li>
                                                                                Post images of house hold items or anything of value, with appropriate descriptions e.g. price, condition of the item etc., to other corpers to sell. We imagine these are items you'd no longer need when you're about having your PoP.
                                                                            </li>
                                                                            <li>
                                                                                <!-- Share the route to your PPA. -->
                                                                                Share the location of your PPA. Remember when you first got to ${state} ?
                                                                                How you were probably lost a bit, you didn't know where your PPA was or any place to begin with!
                                                                                Well, it's the same for most new corpers. While sharing the location of your PPA, please include directions from a popular landmark (like a popular junction, or building or name of place)
                                                                            </li>
                                                                        </ul>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                        <td style="font-size: 0; line-height: 0;" width="20">
                                                            &nbsp;
                                                        </td>
                                                        <td width="260" valign="top">
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                <tr>
                                                                    <td>
                                                                        <img src="cid:003@corpers.online" alt="" width="100%" height="140" style="display: block;" />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                        <ul>
                                                                            <li>
                                                                                Share accommodation details. We want to make it easy for corpers to find accommodation. So when you're about having your PoP or leaving an accommodation you acquired during your service year, share the details online.
                                                                                This is how it works. Your PoP is over and you're leaving your service state, post the accommodation details so a corper can easily find accommodation without the stress of house agents. Also, if your rent isn't over you can collect the rest from the incoming corper so the corper just continues using the accommodation. 
                                                                            </li>
                                                                        </ul>
                                                                        
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                <h3>TL;DR</h3>
                                                When ever you're online, think of other corpers in ${state}. What kind of information would they need. Share valuable information you'd share to your younger self when you first got to ${state}. We call this <b>#Rule28</b>. <!-- If they click it, they should tweet sth about it -->
                                                Of course, mind your language and how you interact online. We trust you've got this.
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#000000" style="padding: 30px 30px 30px 30px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
                                                &reg; Corpers Online 2019
                                            </td>
                                            <td align="right" width="25%">
                                                <table border="0" cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                            <a href="https://twitter.com/OnlineCorpers" style="color: #ffffff;">
                                                                <img src="cid:004@corpers.online" alt="TWTR" width="38" height="38" style="display: block;" border="0" />
                                                            </a>
                                                        </td>
                                                        <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                        <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                            <a href="https://www.facebook.com/CorpersOnline/" style="color: #ffffff;">
                                                                <img src="cid:005@corpers.online" alt="FB" width="38" height="38" style="display: block;" border="0" />
                                                            </a>
                                                        </td>
                                                        <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                        <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                            <a href="https://www.instagram.com/corpersonline/" style="color: #ffffff;">
                                                                <img src="cid:006@corpers.online" alt="IG" width="38" height="38" style="display: block;" border="0" />
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>`, // html body
        attachments: [{
            filename: 'CORPERS ONLINE.png',
            path: 'https://corpers.online/work on/CORPERS ONLINE.png',
            cid: '001@corpers.online' //same cid value as in the html img src
        }, {
            filename: 'CORPERSONLINE.png',
            path: 'https://corpers.online/work on/CORPERSONLINE.png',
            cid: '002@corpers.online' //same cid value as in the html img src
        },
        {
            filename: 'rule28.png',
            path: 'https://corpers.online/work on/rule28.png',
            cid: '003@corpers.online' //same cid value as in the html img src
        },
        {
            filename: 'twitter.png',
            path: 'https://corpers.online/work on/twitter.png',
            cid: '004@corpers.online' //same cid value as in the html img src
        },
        {
            filename: 'facebook.png',
            path: 'https://corpers.online/work on/facebook.png',
            cid: '005@corpers.online' //same cid value as in the html img src
        },
        {
            filename: 'instagram.png',
            path: 'https://corpers.online/work on/instagram.png',
            cid: '006@corpers.online' //same cid value as in the html img src
        }]
    }, (error, info) => {
        if (error) {
            console.log(error);
            // res.status(400).send({success: false})
        } else {
            console.log(info);
            // res.status(200).send({success: true});
            
            console.log('Message sent: %s', info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        }
    });

}

main('juliet.mogaba@aiesec.net', 'Juliet', 'ABIA').catch(console.error); // juliet.mogaba@aiesec.net
