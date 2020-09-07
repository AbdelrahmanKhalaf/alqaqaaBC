var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
const db = require('mongoose');
const cors = require('cors');
const services = require('./routes/services');
const business = require('./routes/business');
const myServices = require('./routes/myServices');
const offers = require('./routes/ourOffers');
const users = require('./routes/users');
const auth = require('./routes/auth');
const evaluation = require('./routes/evaluation');
const rentals = require('./routes/rentals');
const rentalsoffers = require('./routes/rentalsOffers');
const rentalsBusiness = require('./routes/rentalsBusiness');
const errors = require('./middleware/error');
const config = require('config');
const winston = require('winston');
const expressValidator = require('express-validator');
const expressSession = require('express-session');
global.__basedir = require('path').resolve(__dirname, '..');
const alqaqaa = express();
var flash = require('connect-flash');
db.connect('mongodb+srv://abdo2020:01123689625@temwork-vxavl.mongodb.net/alqaqaa?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('connected to mongoDB...')
        PORT = process.env.PORT || 5000
        alqaqaa
            .use(flash())
            .use("/uploads", express.static('./uploads'))
            .use(logger('dev'))
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({ extended: true }))
            .use(express.json())
            .use(cookieParser())
            .use(expressSession({ secret: "max", saveUninitialized: false, resave: false }))
            .use(cors())
            .use('/api/service', services)
            .use('/api/business', business)
            .use('/api/myservices', myServices)
            .use('/api/offers', offers)
            .use('/api/login', auth)
            .use('/api/users', users)
            .use('/api/evaluation', evaluation)
            .use('/api/rentals', rentals)
            .use('/api/rentalsOffers', rentalsoffers)
            .use('/api/rentalsBusiness', rentalsBusiness)
            .listen(PORT, console.log(`Listing on port ${PORT}....`))
            .use(errors)
    })
    .catch((err) => console.log(`Could not connect to mongoDB...${err.message}`));
// if (!config.get('jwtPrivatKey')) {
//     console.log('FALAT ERROR : Privat Key Not Set ');
//     process.exit(1);
// };
module.exports = alqaqaa;