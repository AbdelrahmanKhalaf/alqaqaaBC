const mongoose = require('mongoose');
const joi = require('joi');
const { servicesSchema } = require('./services')
const myServicesSchema = new mongoose.Schema({
    title_ar: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 10,
    },
    title_en: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 10,
    },
    des_ar: {
        type: String,
        required: true,
        maxlength: 400,
        minlength: 10,
    },
    des_en: {
        type: String,
        required: true,
        maxlength: 400,
        minlength: 10,
    },
    services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "services"
        }


    ],
    avatar: {
        type: String,
        default: 'uploads/event.jpg'
    },
    salary: {
        type: Number,
        maxlength: 20,
        minlength: 0,
        required: false,
    },
    outDate: {
        type: Date,
        default: Date.now(),
        required: true
    },
    keywords: {
        type: String,
        maxlength: 300,
        minlength: 7,
        required: true,
    }
});
const myService = mongoose.model('myServices', myServicesSchema);

function validetionMyServices(myService) {
    const schema = {
        title_ar: joi.string().max(50).min(10).required(),
        title_en: joi.string().max(50).min(10).required(),
        des_ar: joi.string().max(400).min(10).required(),
        des_en: joi.string().max(400).min(10).required(),
        servicesId: joi.array(),
        avatar: joi.string(),
        salary: joi.number().required(),
        outDate: joi.date(),
        keywords: joi.string().max(300).min(7).required(),
    };
    return joi.validate(myService, schema)
};
async function validateAvatar(avatar) {
    const schema = {
        avatar: joi.string().required()
    }
    return joi.validate(avatar, schema)
}
exports.myServiceSchema = myServicesSchema;
exports.myService = myService;
exports.validetionMyServices = validetionMyServices;
exports.validateAvatar = validateAvatar;