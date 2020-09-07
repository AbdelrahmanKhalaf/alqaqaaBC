const mongoose = require('mongoose');
const joi = require('joi');
const { ourOffersSchema } = require('./ourOffers');
const rentalsOffersSchema = new mongoose.Schema({
    outDate: {
        type: Date,
        default: Date.now(),
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    offers: [{
        type: ourOffersSchema,
        require: true
    }]

    ,
    address: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        default: 0,
    },

});
const RentalsOffers = mongoose.model('rentalOffers', rentalsOffersSchema);
async function validetionRentalOffers(rentals) {
    const schema = await {
        outDate: joi.date(),
        offersId: joi.string(),
        user: joi.string(),
        address: joi.string().required(),
        addressOffers: joi.string().required(),
        status: joi.number(),
    };
    return joi.validate(rentals, schema)
};
async function validetionRentalOffersUser(rentals) {
    const schema = await {
        outDate: joi.date(),
        offersId: joi.string(),
        user: joi.string(),
        addressOffers: joi.string().required(),
        status: joi.number(),
    };
    return joi.validate(rentals, schema)
};
exports.rentalsOffersSchema = rentalsOffersSchema;
exports.RentalsOffers = RentalsOffers;
exports.validetionRentalOffers = validetionRentalOffers;
exports.validetionRentalOffersUser = validetionRentalOffersUser;