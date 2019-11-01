const multer = require('multer');
const fs = require('fs');
const path = require('path');

const dir = './public/uploads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        cb(null, false);
    } else {
        cb(null, true);
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
}).single('photo');

module.exports = upload;
