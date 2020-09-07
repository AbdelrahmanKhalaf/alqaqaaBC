const mongoose = require('mongoose');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const validator = require('validator')
const schemaUser = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true
    },
    // des: {
    //     type: String,
    //     minlength: 10,
    //     maxlength: 300,
    //     required: true
    // },
    // subject: {
    //     type: String,
    //     minlength: 10,
    //     maxlength: 300,
    //     required: true
    // },
    email: {
        type: String,
        minlength: 11,
        maxlength: 315,
        lowercase: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    phone: {
        type: Number,
        minlength: 8,
        maxlength: 100,
        required: true
    },
    actvition: {
        type: Boolean,
        required: true,
        default: false
    },
    avatar: {
        type: String,
        default: 'uploads/avatar_1587657175473.png',

    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 2015,
        required: true
    },

    facebook: {
        type: String,
        default: "https://www.facebook.com/abdo.booda.562/",
    },
    instagram: {
        type: String,
        default: "https://www.instagram.com/",
    },
    linkedin: {
        type: String,
        default: "https://www.linkedin.com/in/our-dreams-617268175/",
    },
    google: {
        type: String,
        default: "https://mail.google.com/mail/u/0/?tab=rm&ogbl&pli=1#",
    },
    twitter: {
        type: String,
        default: "https://twitter.com/dreams_abdo"
    },
    oreders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'myservices '

    }],
    offers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ouroffers'

    }],
    date: {
        type: Date,
        default: Date.now('yyy/dd/mmm')
    },
    address: {
        type: String,
        minlength: 11,
        maxlength: 30,
    },
    resetLink: {
        data: String,
        default: ""
    },
    verify: {
        type: Boolean,
        default: false,
    }
});

schemaUser.methods.generaToken = function() {
    const token = jwt.sign({ _id: this._id, actvition: this.actvition, email: this.email, name: this.name }, config.get('jwtPrivatKey'));
    return token;
}
const User = mongoose.model('user', schemaUser);
async function validateUser(user) {
    const schema = await {
        name: joi.string().min(8).max(30).required(),
        email: joi.string().min(8).max(315).required(),
        phone: joi.number().min(11).required(),
        password: joi.string().min(8).max(315).required(),
        actvition: joi.boolean(),
        facebook: joi.string(),
        google: joi.string(),
        twitter: joi.string(),
        instagram: joi.string(),
        linkedin: joi.string(),
        oredersId: joi.array(),
        offersId: joi.array(),
        date: joi.date(),
        address: joi.string().required().min(11).max(30)
    }
    return joi.validate(user, schema)
}
async function validateUserUpdate(userUpdate) {
    const schema = await {
        name: joi.string().min(8).max(315).required(),
        email: joi.string().min(8).max(315).required(),
        phone: joi.number().min(11).required(),
        address: joi.string().required().min(11).max(315)

    }
    return joi.validate(userUpdate, schema)
};
async function validateUserPassword(userUpdate) {
    const schema = await {
        password: joi.string().min(8).max(100).required(),
        newPass: joi.string().min(8).max(100).required(),
    }
    return joi.validate(userUpdate, schema)
};
async function validateUserEmail(userUpdate) {
    const schema = await {
        email: joi.string().min(8).max(100).required(),
    }
    return joi.validate(userUpdate, schema)
};
async function Feedback(user) {
    const schema = await {
        des: joi.string().min(8).max(100).required(),
        subject: joi.string().min(8).max(100).required(),
        email: joi.string().min(8).max(100).required(),
        name: joi.string().min(8).max(100).required()
    }
    return joi.validate(user, schema)
};

exports.schemaUser = schemaUser;
exports.User = User;
exports.validateUser = validateUser;
exports.validateUserUpdate = validateUserUpdate;
exports.validateUserPassword = validateUserPassword;
exports.validateUserEmail = validateUserEmail;
exports.Feedback = Feedback;