const   express = require("express"),
        feedRouter = express.Router();

const   FeedController = require('../controllers/FeedController'),
        { requireLogin } = require('../services/checkauth'),
        { profileIsFilled } = require('../services/checkuserdata'),
        { sanitizeBody } = require('../services/sanitize');

feedRouter.use(requireLogin, profileIsFilled);

feedRouter.get('/browse', (req, res) => {
        res.render('feed');
});

feedRouter.get('/browse/fetch', FeedController.browseDefault);
feedRouter.post('/search/custom', sanitizeBody, FeedController.customSearch);
feedRouter.get('/search/interest/:text', FeedController.findByInterest);

module.exports = feedRouter;
