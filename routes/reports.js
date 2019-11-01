const   express = require("express"),
        reportsRouter = express.Router();

const   ReportsController = require('../controllers/ReportsController'),
        { requireLogin } = require('../services/checkauth');

reportsRouter.use(requireLogin);

reportsRouter.get('/fake/:userId', ReportsController.fake);

reportsRouter.get('/block/:userId', ReportsController.block);

reportsRouter.get('/unblock/:userId', ReportsController.unblock);

module.exports = reportsRouter;