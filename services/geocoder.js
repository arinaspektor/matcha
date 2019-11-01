const { geocoderOptions } = require('../config/services_config');
const NodeGeocoder = require("node-geocoder")(geocoderOptions);

module.exports = {
    decodeLocation: (location) => {
        return NodeGeocoder.geocode(location);
    },

    decodeLocationReverse: (data) => {
        return NodeGeocoder.reverse(data);
    }
};

