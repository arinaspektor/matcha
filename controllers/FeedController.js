const mongoose = require('mongoose');

const User = mongoose.model('user');

module.exports = {
    browseDefault: (req, res) => {
        const { user } = req;

        const toFind =  user.sexPreferences.toString() === 'bisexual'
                        ? ["male", "female"]
                        : [ user.sexPreferences.toString()];

        const lon = Number(user.location.coordinates[0]);
        const lat = Number(user.location.coordinates[1]);

        User
            .aggregate([
                { $geoNear:
                    {
                        near: {
                            type: "Point",
                            coordinates: [lon, lat] 
                        },
                        spherical: true,
                        distanceField: "distance",
                        maxDistance: 100000,
                        minDistance: 0,
                        key: 'location'
                    }
                },
                { $match:
                    { _id: { $ne: user._id},
                        isVerified: true,
                        gender: {$in: toFind}
                    }
                }
            ], (err, data) => {

                const users = [];

                if (! err && data.length) {

                    data.map((profile) => {
                        if (! user.blockedUsers.find(o => o.blockedId.toString() === profile._id.toString())) {
                            const picture = profile.pictures.find(o => o.isProfile);
                            users.push({ id: profile._id,
                                        username: profile.username,
                                        picture: picture ? picture.src : null,
                                        age: profile.age,
                                        distance: Math.round(profile.distance / 1000),
                                        tags: profile.interests,
                                        rating: (profile.likes ? profile.likes.length : 0) * 2 + (profile.visits ? profile.visits.length : 0)});


                            users.sort((a, b) => {
                                let aMatch = 0,
                                    bMatch = 0;

                                    a.tags.forEach(tag => {
                                        aMatch += user.interests.filter(t => t.text.toString() === tag.text.toString()).length;
                                    });
    
                                    b.tags.forEach(tag => {
                                        bMatch += user.interests.filter(t => t.text.toString() === tag.text.toString()).length;
                                    });

                                    if (aMatch === bMatch)
                                        return  Number(b.rating) - Number(a.rating);
                                    return bMatch - aMatch;
                            });
                        }
                    });
                }

                res.json(users);
            });
      
    },

    findByInterest: (req, res) => {
        const { user } = req;

        const text = req.sanitize(req.params.text);

        const lon = Number(user.location.coordinates[0]);
        const lat = Number(user.location.coordinates[1]);

        User
            .aggregate([
                { $geoNear:
                    {
                        near: {
                            type: "Point",
                            coordinates: [lon, lat] 
                        },
                        spherical: true,
                        distanceField: "distance",
                        maxDistance: 1000000000,
                        minDistance: 0,
                        key: 'location'
                    }
                },
                { $match:
                    {   _id: { $ne: user._id},
                        isVerified: true,
                        interests: {$elemMatch: {text}},
                    }
                }
            ], (err, data) => {
                const users = [];

                if (! err) {
                    data.map((profile) => {
                        if (! user.blockedUsers.find(o => o.blockedId.toString() === profile._id.toString())) {
                            const picture = profile.pictures.find(o => o.isProfile);
                            
                            users.push({ id: profile._id,
                                username: profile.username,
                                picture: picture ? picture.src : null,
                                age: profile.age,
                                distance: Math.round(profile.distance / 1000),
                                tags: profile.interests,
                                rating: (profile.likes ? profile.likes.length : 0) * 2 + (profile.visits ? profile.visits.length : 0)});
                        }
                    });
                }
                res.json(users);
            });
    },
    
    customSearch: (req, res) => {
        const { user } = req;
        let {   agemin, agemax,
                distancemin, distancemax,
                famemin, famemax} = req.value['body'];

        agemin = agemin ?  Number(agemin) : 16;
        agemax = agemax ?  Number(agemax) : 100;
        distancemin = distancemin ? Number(distancemin) * 1000 : 0;
        distancemax = distancemax ? Number(distancemax) * 1000 : 100000000;
        famemin = famemin ? Number(famemin) : 0;
        famemax = famemax ? Number(famemax) : 100000000;

        const lon = Number(user.location.coordinates[0]);
        const lat = Number(user.location.coordinates[1]);

        User
            .aggregate([
                { $geoNear:
                    {
                        near: {
                            type: "Point",
                            coordinates: [lon, lat] 
                        },
                        spherical: true,
                        distanceField: "distance",
                        maxDistance: distancemax,
                        minDistance: distancemin,
                        key: 'location'
                    }
                },
                { $match:
                    {   _id: { $ne: user._id},
                        isVerified: true,
                        age: {$gte: agemin, $lte: agemax}
                    }
                }
            ], (err, data) => {
                let users = [];

                if (! err && data.length) {

                    data.map((profile) => {
                        if (! user.blockedUsers.find(o => o.blockedId.toString() === profile._id.toString())) {
                            const picture = profile.pictures.find(o => o.isProfile);
                            users.push({ id: profile._id,
                                        username: profile.username,
                                        picture: picture ? picture.src : null,
                                        age: profile.age,
                                        distance: Math.round(profile.distance / 1000),
                                        tags: profile.interests,
                                        rating: (profile.likes ? profile.likes.length : 0) * 2 + (profile.visits ? profile.visits.length : 0)});

                            users = users.filter(user => { return user.rating >= famemin && user.rating <= famemax});
                        }
                    });
                }

                res.json(users);
            });
      

        
    }
}