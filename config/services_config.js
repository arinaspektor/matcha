const geocoderOptions = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};

module.exports = {
    geocoderOptions
};