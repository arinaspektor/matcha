const   express = require("express"),
        notificationsRouter = express.Router();

const   NotificationsController = require('../controllers/NotificationsController'),
        { requireLogin } = require('../services/checkauth');

notificationsRouter.use(requireLogin);

notificationsRouter.get('/all', NotificationsController.all);

notificationsRouter.get('/delete/:id', NotificationsController.delete);

module.exports = notificationsRouter;