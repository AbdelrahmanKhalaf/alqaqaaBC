var express = require('express');
var router = express.Router();
const joi = require('joi')
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const { User } = require('../model/users');
router.post('/', async(req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ error_en: 'invalid email / or password', error_ar: 'البريد الإلكتروني أو كلمة السر خاطئة' });
    let validPassword = await User.findOne({ password: req.body.password });
    if (!validPassword) return res.status(400).send({ error_en: 'invalid email / or password', error_ar: 'البريد الإلكتروني أو كلمة السر خاطئة' });
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(user.password, salt)
    await user.save();
    const token = user.generaToken()
    res.header('x-auth-token', token)
    res.status(200).send({
        user: user,
        bearer: token,
    })
});
async function validateUser(auth) {
    const schema = await {
        email: joi.string().min(8).max(315).email().required(),
        password: joi.string().min(8).max(315).required(),
    }
    return joi.validate(auth, schema)
}

module.exports = router;