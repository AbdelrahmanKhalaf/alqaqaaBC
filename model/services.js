const mongoose = require('mongoose');
const joi = require('joi');

const servicesSchema = new mongoose.Schema({
    name_ar: {
        type: String,
        required: true,
        maxlength: 40,
        minlength: 3,
    },
    name_en: {
        type: String,
        required: true,
        maxlength: 40,
        minlength: 3,
    },
    date: {
        type: Date,
        default: Date.now()
    },

});
const Service = mongoose.model('services', servicesSchema);

function validtionService(services) {
    const schema = {
        name_ar: joi.string().max(40).min(3).required(),
        name_en: joi.string().max(40).min(3).required(),
        date: joi.date(),
    };
    return joi.validate(services, schema);
}
exports.servicesSchema = servicesSchema;
exports.Service = Service;
exports.validateService = validtionService;