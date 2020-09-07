const mongoose = require('mongoose');
const joi = require('joi');
const { servicesSchema } = require('./services')
const businessSchema = new mongoose.Schema({
    title_en: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 7,
    },
    title_ar: {
        type: String,
        required: true,
        maxlength: 50,
        minlength: 7,
    },
    des_en: {
        type: String,
        required: true,
        maxlength: 400,
        minlength: 10,
    },
    des_ar: {
        type: String,
        required: true,
        maxlength: 400,
        minlength: 10,
    },
    services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "services",
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
    },
    outDate: {
        type: Date,
        default: Date.now(),
    },
    keywords: {
        type: String,
        maxlength: 300,
        minlength: 7,
        required: true,
    }
});
const Business = mongoose.model('business', businessSchema);
async function validetionBusiness(BusinessV) {
    const schema = await {
        title_en: joi.string().max(50).min(7).required(),
        title_ar: joi.string().max(50).min(7).required(),
        des_ar: joi.string().max(400).min(10).required(),
        des_en: joi.string().max(400).min(10).required(),
        services: joi.array(),
        avatar: joi.string(),
        salary: joi.number(),
        outDate: joi.date(),
        keywords: joi.string().max(300).min(7).required(),
    };
    return joi.validate(BusinessV, schema)
};
exports.businessSchema = businessSchema;
exports.Business = Business;
exports.validetionBusiness = validetionBusiness;