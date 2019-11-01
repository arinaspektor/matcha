const   express = require("express"),
        chatRouter = express.Router();

const   ChatController = require('../controllers/ChatController'),
        { requireLogin } = require('../services/checkauth');

chatRouter.use(requireLogin);

chatRouter.get("/all", ChatController.all);

chatRouter.get("/private/:chatId", ChatController.private);

module.exports = chatRouter;

