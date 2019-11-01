const   mongoose = require('mongoose'),
        passport = require('passport'),
        random = require('randomstring');

const   LocalStrategy = require('passport-local'),
        FortyTwoStrategy = require('passport-42').Strategy;

const   User = mongoose.model('user');

const { HOST,
        FT_CLIENT_ID,
        FT_CLIENT_SECRET } = process.env;

const { decodeLocation } = require('../services/geocoder');

passport.use(new FortyTwoStrategy({
    clientID: FT_CLIENT_ID,
    clientSecret: FT_CLIENT_SECRET,
    callbackURL: "http://" + HOST + "/auth/42/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.find({intra_id: profile.id});
        if (user.length > 0) {
            return done(null, user[0]);
        }

        const data = JSON.parse(profile._raw);

        const usernameIsUnique = await User.find({username: data.login});
        if (usernameIsUnique.length > 0) {
            return done(null, false, {
                message: "User with this username already exists"
            });
        }

        const emailIsUnique =  await User.find({email: data.email});
        if (emailIsUnique.length > 0) {
            return done(null, false, {
                message: "User with this email already exists"
            });
        }

        const locationData = await decodeLocation(data.campus[0].city);
        const { city, latitude, longitude } = locationData[0];

        user = new User({
            intra_id: data.id,
            username: data.login,
            lastname: data.last_name,
            firstname: data.first_name,
            email: data.email,
            isVerified: true,
            pictures: [{
                pic_id: random.generate(10),
                src: data.image_url,
                isProfile: true
            }],
            locationname: city,
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)]
            },
            interests: [{
                    text: "dating"
                },
                {
                    text: 'coding'
                }
            ]
        });

        await user.save();

        done(null, user);
    } catch(err) {
        done(err, false);
    }
}));

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	User.findById(user._id).populate('blockedUsers', 'blockedId').populate('likes').exec((err, user) => {
		done(err, user);
    });
});
