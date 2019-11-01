require('dotenv').config();

const 	express = require('express'),
		bodyParser = require('body-parser'),
		redis = require('redis'),
		cookieParser = require('cookie-parser'),
		session = require('express-session'),
		mongoose = require('mongoose'),
		passport = require('passport'),
		expressSanitizer = require('express-sanitizer'),
		methodOverride = require("method-override"),
		flash = require("connect-flash"),
		moment = require("moment");

const	redisStore = require('connect-redis')(session),
		redisClient = redis.createClient();

const { PORT,
		REDIS_PORT,
		REDIS_TTL,
		SESSION_SECRET } = process.env;

const { mongooseOpts } = require('./config/config');

const 	sessionStore = new redisStore({
		host: 'localhost',
		port: REDIS_PORT,
		client: redisClient,
		ttl: REDIS_TTL
});
		
const	app = express(),
		server = require('http').Server(app);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	store: sessionStore,
	cookie: { secure: false },
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));
app.use(expressSanitizer());
app.use(flash());


mongoose.connect("mongodb://localhost/matcha", mongooseOpts);
// mongoose.set('debug', true);

redisClient.on('error', (err) => {
	console.log('Redis:', err);
});


require('./models/UserModel');
require('./models/InterestModel');
require('./models/BlockedModel'),
require('./models/LikesModel'),
require('./models/VisitsModel'),
require('./models/FakeModel'),
require('./models/ChatModel'),
require('./models/MessageModel'),
require('./models/NotificationModel');
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));


app.use((req, res, next) => {
	res.locals =  {
		interval: moment,
		currentUser: req.user,
		error: req.flash("error"),
		success: req.flash("success")
	};

	next();
});

const 	{ requireLogin } = require('./services/checkauth');

const 	authRouter = require('./routes/auth'),
		passwordRouter = require('./routes/password'),
		profileRouter = require('./routes/profile'),
		feedRouter = require('./routes/feed'),
		likesRouter =  require('./routes/likes'),
		historyRouter = require('./routes/history'),
		reportsRouter = require('./routes/reports'),
		chatRouter = require('./routes/chat'),
		notificationsRouter = require('./routes/notifications');


app.get('/signout', requireLogin, (req, res) =>{
	req.logout();
	req.flash("success", "You are successfully signed out!");
	res.redirect("/");
})
app.use('/profile', profileRouter);
app.use('/feed', feedRouter);
app.use('/likes', likesRouter);
app.use('/history', historyRouter);
app.use('/report', reportsRouter);
app.use('/chat', chatRouter);
app.use('/notification', notificationsRouter);
app.use(passwordRouter);
app.use(authRouter);
app.use('*', (req, res) => { res.redirect("/"); });

const	io = require('socket.io')(server, { pingTimeout: 60000 }),
		passportIo = require('passport.socketio'),
		{ onConnect, connectedToChat } = require('./services/socket');

server.listen(PORT, () => {
	console.log(PORT +  " is listening...");
});

io.use(passportIo.authorize({
	key: 'connect.sid',
	secret: SESSION_SECRET,
	store: sessionStore,
	passport: passport,
	cookieParser: cookieParser
}));

io.on('connection', onConnect);

io.of('/chat').on('connection', connectedToChat);

