const mongoose = require('mongoose');
const joi = require('joi');
const { ourOffersSchema } = require('./ourOffers');
const { businessSchema } = require('./business')
const { schemaUser } = require('./users')
const rentalsSchema = new mongoose.Schema({
    outDate:
    {
        type: Date,
        default: Date.now(),
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
    ,
    offers:
        [{
            type:ourOffersSchema
        }]


    ,
    business:
        [
            {
                type: businessSchema
            }
        ],
});
const Rentals = mongoose.model('rental', rentalsSchema);
function validetionRental(rentals) {
    const schema =
    {
        outDate: joi.date(),
        offersId: joi.array(),
        businessId: joi.array(),
        user: joi.array(),
    };
    return joi.validate(rentals, schema)
};
exports.rentalsSchema = rentalsSchema;
exports.Rentals = Rentals;
exports.validetionRental = validetionRental;