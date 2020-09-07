var express = require('express');
var router = express.Router();
const { Business, validetionBusiness } = require('../model/business');
const { Service } = require('../model/services');
require('express-async-errors');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + '.png')
    }
})
const fileFilter = function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}
var upload = multer({
    storage: storage,

    fileFilter: fileFilter
})
var type = upload.single('avatar')
router.get('/', async(req, res) => {
    const business = await Business.find().sort('name');
    res.send(business);
});
router.post('/', [auth, admin], async(req, res) => {
    const { error } = validetionBusiness(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_en = await Business.findOne({ title_en: req.body.title_en });
    let title_ar = await Business.findOne({ title_ar: req.body.title_ar });
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    let business = new Business({
        title_en: req.body.title_en,
        title_ar: req.body.title_ar,
        des_en: req.body.des_en,
        des_ar: req.body.des_ar,
        services: req.body.services,
        avatar: req.body.avatar,
        salary: req.body.salary,
        outDate: req.body.outDate,
        keywords: req.body.keywords,
    });
    business = await business.save()
    res.send(business);

});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validetionBusiness(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_en = await Business.findOne({ title_en: req.body.title_en });
    let title_ar = await Business.findOne({ title_ar: req.body.title_ar });
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    let business = await Business.findByIdAndUpdate(req.params.id, {
        title_en: req.body.title_en,
        title_ar: req.body.title_ar,
        des_en: req.body.des_en,
        des_ar: req.body.des_ar,
        salary: req.body.salary,
        keywords: req.body.keywords,
    });
    if (!business) return res.status(404).send("invalid business ");
    business = await business.save()
    res.send(business)
});
router.delete('/:id', [auth, admin], async(req, res, next) => {

    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).send("invalid business ");
    res.send({ message: 'done well, the business was deleted successfully' });
});
router.get('/:id', async(req, res) => {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).send("invalid business");
    res.send(business);
})
router.put('/avatar/:id', [auth, type], async(req, res) => {
    const { error } = validetionBusiness(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const avatar = await Business.findByIdAndUpdate(req.params.id);
    if (!avatar) return res.status(404).send("The Business Can't Found Can You trying again")
    avatar.set({
        avatar: req.file.path
    })
    res.status(200).send(avatar);
    avatar.save()
});
module.exports = router;