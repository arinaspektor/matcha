const { decodeLocation } = require('./geocoder');

const isValidEmail = (email) => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(String(email).toLowerCase());
}

const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,50}$/;

    return regex.test(String(password));
}

const checkRegisterData = (userdata, edit = false) => {
    const { username, email,
        firstname, lastname,
        password, confirmedPassword } = userdata;

    let error = '';
    
    if (! username || username.length < 3 || username.length > 20)
        error = 'Username must be 3-20 characters long';
    else if (! email || ! isValidEmail(email))
        error = 'Invalid email';
    else if (! firstname )
        error = 'Firstname can not be empty';
    else if (! lastname )
        error = 'Lastname can not be empty';
    else if (! edit && (! password || ! isValidPassword(password)))
        error = 'Password must contain at least one number, one uppercase and lowercase letter, 8-50 characters long';
    else if (! edit && String(password).localeCompare(String(confirmedPassword)))
        error = 'Password must match confirmation';

    return error;
}

const checkProfileData = (userdata) => {
    let error = '';
    const { age, gender, location, sexPreferences, bio} = userdata;

    if (typeof age === 'undefined')
        error = "Please, add your age!";
    else if (Number(age) < 14)
        error = "You are too young. Please come back when you will 14 years old at least."
    else if (Number(age) > 100)
        error = "Sorry but we dont't believe you!";
    else if (gender !== "female" && gender != "male")
        error = "Sorry but this site is only for women and men:(";
    else if (sexPreferences !== "female"
            && sexPreferences !== "male"
            && sexPreferences !== "bisexual") {
                error = "Valid options for sex preferences are female, male and bisexual";
    }
    else if (bio.length < 5 || bio.length > 300)
        error = "Please make sure there's 5-300 characters in your bio";
    else if (! location.length)
        error = "Location can't be empty";

    return error;
}

module.exports = {
    validateRegisterData: (req, res, next) => {
        const error = checkRegisterData(req.value.body);

        if (error.length > 0) {
            req.flash("error", error);
            return res.redirect("/signup");
        }

        next(); 
    },

    validateEditingData: (req, res, next) => {
        let error = checkRegisterData(req.value.body, true);

        if (! error.length)
            error = checkProfileData(req.value.body);

        if (error.length > 0) {
            req.flash("error", error);
            return res.redirect("back");
        }

        next();
    },

    validatePassReset: async (req, res, next) => {
        const {password, confirmedPassword} = req.value.body;
        let error = '';

        if (! password || ! isValidPassword(password))
            error = 'Password must contain at least one number, one uppercase and lowercase letter, 8-50 characters long';
        else if ( String(password).localeCompare(String(confirmedPassword)))
            error = 'Password must match confirmation';

        if (error.length > 0) {
            req.flash("error", error);
            return res.redirect("back");
        }
    
        next(); 
    },

    isValidInterest: (req, res, next) => {
        const interestRegex = RegExp("^[A-Za-z0-9]{2,30}$");
        const { interest } = req.value['body'];

        if (interestRegex.test(interest))
            return next();
        
        req.flash("error", "Please make sure that you've entered only alphanumericals!");
        res.redirect("back");
    }
}