const   express = require("express"),
        passwordRouter = express.Router();

const   { validatePassReset } = require('../services/validation'),
        { sanitizeBody } = require('../services/sanitize'),
        { checkOauthAndVerified } = require('../services/checkuserdata');

const   PasswordController = require('../controllers/PasswordController');

passwordRouter.route("/forgot")
    .get((req, res) => {
        res.render("forgot");
    })
    .post(sanitizeBody, checkOauthAndVerified, PasswordController.sendResetMail);


passwordRouter.route("/reset/:token")
    .get(PasswordController.resetCheck)
    .post(sanitizeBody, validatePassReset, PasswordController.resetPass);

module.exports = passwordRouter;
