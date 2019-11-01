const   express = require("express"),
        profileRouter = express.Router();

const   ProfileController = require('../controllers/ProfileController'),
        UserController = require('../controllers/PasswordController'),
        { validateEditingData, isValidInterest } = require('../services/validation'),
        { sanitizeBody } = require('../services/sanitize'),
        upload = require('../services/upload'),
        { requireLogin } = require('../services/checkauth'),
        { countPhotos, fileIsPresent, belongsToUser, 
        checkOauth, isUnique, checkLocation, checkIfBlocked } = require('../services/checkuserdata');

profileRouter.use(requireLogin);

profileRouter.get("/", (req, res) => {
        res.render("profile", { user: req.user, chatId: null, settings: false});
});

profileRouter.get("/view/:username", checkIfBlocked, ProfileController.view);

profileRouter.route("/edit")
        .get((req, res) => {
                res.render("settings", { user: req.user, settings: true });
        })
        .post(  sanitizeBody, validateEditingData,
                isUnique, checkLocation,
                ProfileController.updateUserData
        );

profileRouter.get("/forgot", checkOauth, UserController.sendResetMail);

profileRouter.post("/upload", countPhotos, upload, fileIsPresent, ProfileController.finalUpload);

profileRouter.get("/:pic_id/delete", belongsToUser, ProfileController.deletePhoto);

profileRouter.get("/:pic_id/setasprofile", belongsToUser, ProfileController.setAsProfile);

profileRouter.post("/interests/add", sanitizeBody, isValidInterest, ProfileController.addInterest);

profileRouter.get("/interests/:interest_id/delete",  ProfileController.deleteInterest);

profileRouter.get("/interests/getlist", ProfileController.getInterestsList);

module.exports = profileRouter;