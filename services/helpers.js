const   iplocate = require('node-iplocate'),
        { decodeLocationReverse } = require('./geocoder');

const decodeByCoords = async (location) => {
    const geoData = JSON.parse(location);

    const res = await decodeLocationReverse(geoData);
    const { city, latitude, longitude } = res[0];

    return  { city, latitude, longitude }; 
}

const decodeByIp = async () => {
     // const ip = req.header('x-forwarded-for') || req.ip || req.connection.remoteAddress; // Will not work on localhost
     const ip = "212.90.62.175"

     const res = await iplocate(ip);
     const { city, latitude, longitude } = res;

     return { city, latitude, longitude };
}

module.exports = {
    addLocation: (req, res, next ) => {
            const { location } = req.body;

            return ((location !== "") ? decodeByCoords(location) : decodeByIp())
                .then(res => {
                    req.value['body'].location = res;

                    next();
                })
                .catch(err => {
                    req.flash("error", 'Something went wrong...Try again later');
                    res.redirect("/signup");
                });
    }
}