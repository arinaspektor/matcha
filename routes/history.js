const   express = require("express"),
        historyRouter = express.Router();

const   HistoryController = require('../controllers/HistoryController'),
        { requireLogin } = require('../services/checkauth');

historyRouter.use(requireLogin);

historyRouter.get('/visits', HistoryController.showVisits);

historyRouter.get('/likes', HistoryController.showLikes);

module.exports = historyRouter;