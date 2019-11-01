module.exports = {
    sanitizeBody: (req, res, next) => {
        const data = {};
        
        Object.keys(req.body).map(function(key) {
            if (req.body[key] !== '')
                data[key] = req.sanitize(req.body[key]).trim();
        });

        if (! req.value) req.value = {};
        req.value['body'] = data;

        next();
    }
}