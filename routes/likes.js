const   express = require("express"),
        likesRouter = express.Router();

const   LikesController = require('../controllers/LikesController'),
        { requireLogin } = require('../services/checkauth'),
        { isValidLike, checkIfBlockedForFetch } = require('../services/checkuserdata');

likesRouter.use(requireLogin);

likesRouter.get('/add/:userId', checkIfBlockedForFetch, isValidLike, LikesController.add);

likesRouter.get('/delete/:userId', LikesController.delete);

module.exports = likesRouter;