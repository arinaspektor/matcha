const mailer = require('nodemailer');

const transporter = mailer.createTransport({ 
    sendmail: true
});

class Mail {

    constructor() {
        this.from = 'no-reply@matcha.unit.ua';
    }

    sendMail(to, subject, html) {
        const from = this.from;

        return new Promise((resolve, reject) => {
            transporter.sendMail({ from, subject, to, html }, (err, info) => {
                if(err) reject(err);
                resolve(info);
            });
        });
    }
}

class VaryfingMail extends Mail {

    constructor(to, url) {
        super();

        this.to = to;
        this.subject = "Please verify your email!";
        this.html = `
        <h4>Hi!</h4>

        <p>Congrats, you were successfully registered!</p>
        
        <p>To confirm your email please follow the <a href = ${url}>link</a>.</p>
        
        <p>After that login into the system.</p>
        
        <p>If it was not you, just ignore this letter.</p>
        
        <p>Thank you for joining Matcha!</p>`;
    }

    send() {
        return this.sendMail(this.to, this.subject, this.html);
    }
}


class ResetPassMail extends Mail {

    constructor(to, url) {
        super();

        this.to = to;
        this.subject = "Password recovery";
        this.html = `
        <h4>Hi!</h4>

        <p>To change your password, click <a href = ${url}>here</a>.</p>

        <p>Thank you for using Matcha!</p>`;
    }

    send() {
        return this.sendMail(this.to, this.subject, this.html);
    }
}

module.exports = {
    VaryfingMail,
    ResetPassMail
}