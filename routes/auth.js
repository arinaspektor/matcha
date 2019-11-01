const   express = require("express"),
        authRouter = express.Router(),
        passport = require('passport');

const   { validateRegisterData } = require('../services/validation'),
        { sanitizeBody } = require('../services/sanitize'),
        { isUnique, isVerified } = require('../services/checkuserdata'),
        { checkIfSignedIn } = require('../services/checkauth'),
        { addLocation } = require('../services/helpers');

const   AuthController = require('../controllers/AuthController');

authRouter.use(checkIfSignedIn);

authRouter.get('/', (req, res) => {
    res.render("signin");
});

authRouter.route("/signin")
    .get((req, res) => {
        res.render("signin");
    })
    .post(sanitizeBody, isVerified, passport.authenticate('local', {
        successRedirect: "/feed/browse",
        failureRedirect: "/signin",
        failureFlash: true
    }));

authRouter.route("/signup")
    .get((req, res) => {
        res.render("signup");
    })
    .post(sanitizeBody, validateRegisterData, isUnique, addLocation, AuthController.signUp);


authRouter.get("/auth/42", passport.authenticate('42'));


authRouter.get("/auth/42/callback", passport.authenticate('42', {
        failureRedirect: '/signin',
        failureFlash: true,
    }), (req, res) => {
        res.redirect("/feed/browse");
});


authRouter.get("/verification/:token", AuthController.verify);



module.exports = authRouter;