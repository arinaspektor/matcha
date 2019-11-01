const   path = require('path');

const   mongooseOpts = {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex: true,
            useUnifiedTopology: true 
        }

const   ROOT = path.dirname(require.main.filename);

module.exports = {
    mongooseOpts,
    ROOT
}