const mongoose = require('mongoose');
const joi = require('joi');
const { servicesSchema } = require('./services')
const ourOffersSchema = new mongoose.Schema({
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
            type: servicesSchema
        }


    ],

    avatar: {
        type: String,
        default: 'uploads/event.jpg'
    },
    salary: {
        type: Number,

    },
    outDate: {
        type: Date,
        default: Date.now(),
        required: true
    },
    keywords: {
        Date: String,
    }
});
const Offers = mongoose.model('ourOffers', ourOffersSchema);
async function validetionOffers(ourOffers) {
    const schema = await {
        title_ar: joi.string().max(50).min(10).required(),
        title_en: joi.string().max(50).min(10).required(),
        des_ar: joi.string().max(400).min(10).required(),
        des_en: joi.string().max(400).min(10).required(),
        servicesId: joi.array(),
        salary: joi.number(),
        outDate: joi.date(),
        keywords: joi.string(),

    };
    return joi.validate(ourOffers, schema)
};
async function validateAvatar(avatar) {
    const schema = {
        avatar: joi.string().required()
    }
    return joi.validate(avatar, schema)
}
exports.ourOffersSchema = ourOffersSchema;
exports.Offers = Offers;
exports.validetionOffers = validetionOffers;
exports.validateAvatar = validateAvatar;