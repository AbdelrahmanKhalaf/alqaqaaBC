const mongoose = require('mongoose');
const joi = require('joi');
const { businessSchema } = require('./business')
const rentalsBusinessSchema = new mongoose.Schema({
    outDate:
    {
        type: Date,
        default: Date.now(),
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required:true
    }
    ,
    business:
        [
            {
            type:businessSchema,
            require:true
            }
        ]
    ,
    address : 
    {
        type:String,
        required:true,
        maxlength:400,
        minlength:5,
    },
    status:
    {
        type:Number,
        default:0,
    }
});
const RentalsBusiness = mongoose.model('rentalBusiness', rentalsBusinessSchema);
function validetionRentalBusiness(rentals) {
    const schema =
    {
        outDate: joi.date(),
        businessId: joi.string(),
        user: joi.string(),
        address : joi.string().max(400).min(5).required(),
        status:joi.number(),
    };
    return joi.validate(rentals, schema)
};
exports.rentalsBusinessSchema = rentalsBusinessSchema;
exports.RentalsBusiness = RentalsBusiness;
exports.validetionRentalBusiness = validetionRentalBusiness;