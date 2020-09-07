var express = require('express');
var router = express.Router();
const { Offers, validetionOffers, validateAvatar } = require('../model/ourOffers');
const { Service } = require('../model/services');
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

require('express-async-errors');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
router.get('/', async(req, res) => {
    const offers = await Offers.find().sort('title');
    res.send(offers);
});
router.post('/', [auth, admin], async(req, res) => {
    const { error } = validetionOffers(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_ar = await Offers.findOne({ title_ar: req.body.title_ar });
    let title_en = await Offers.findOne({ title_en: req.body.title_en });
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    const servicesId = req.body.servicesId
    const Id = await []
    servicesId.forEach(async doc => {
        const catgServices = await Service.findById(doc)
        if (!catgServices) return res.status(404).send("invalid catgServices ")
        return Id.push(catgServices)
    });
    setTimeout(() => {
        var offers = new Offers({
            title_ar: req.body.title_ar,
            title_en: req.body.title_en,
            des_ar: req.body.des_ar,
            des_en: req.body.des_en,
            services: Id,
            avatar: req.body.avatar,
            salary: req.body.salary,
            outDate: req.body.outDate,
            keywords: req.body.keywords,
        });
        res.status(200).send({ offers: offers });
        offers.save()

    }, 500);
});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validetionOffers(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_ar = await Offers.findOne({ title_ar: req.body.title_ar });
    let title_en = await Offers.findOne({ title_en: req.body.title_en });
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    let offers = await Offers.findByIdAndUpdate(req.params.id, {
        title_ar: req.body.title_ar,
        des_ar: req.body.des_ar,
        title_en: req.body.title_en,
        des_en: req.body.des_en,
        salary: req.body.salary,
        keywords: req.body.keywords

    });
    if (!offers) return res.status(404).send("invalid Offers ");
    offers = await offers.save()
    res.send(offers)
});
router.delete('/:id', [auth, admin], async(req, res, next) => {

    const offers = await Offers.findByIdAndDelete(req.params.id);
    if (!offers) return res.status(404).send("invalid offers ");
    res.send({ message: 'done well, the offers was deleted successfully' });
});
router.get('/:id', async(req, res) => {
    const offers = await Offers.findById(req.params.id);
    if (!offers) return res.status(404).send("invalid Offers");
    res.send(offers);
})
router.put('/avatar/:id', [auth, admin, type], async(req, res) => {
    const { error } = validateAvatar(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const avatar = await Offers.findByIdAndUpdate(req.params.id);
    if (!avatar) return res.status(404).send("The Offers Can't Found Can You trying again")
    avatar.set({
        avatar: req.file.path
    })
    res.status(200).send(avatar);
    avatar.save()
});
module.exports = router;