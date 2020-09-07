var express = require('express');
var router = express.Router();
const { myService, validetionMyServices, validateAvatar } = require('../model/myServices');
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
    const myservice = await myService.find().sort('name');
    res.send(myservice);
});
router.post('/', [auth, admin], async(req, res) => {
    const { error } = validetionMyServices(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_ar = await myService.findOne({ title_ar: req.body.title_ar });
    let title_en = await myService.findOne({ title_en: req.body.title_en });
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    let myservice = new myService({
        title_ar: req.body.title_ar,
        title_en: req.body.title_en,
        des_ar: req.body.des_ar,
        des_en: req.body.des_en,
        services: req.body.servicesId,
        avatar: req.body.avatar,
        salary: req.body.salary,
        outDate: req.body.outDate,
        keywords: req.body.keywords

    });

    myservice = await myservice.save()
    res.send(myservice);

});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validetionMyServices(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let title_ar = await myService.findOne({ title_ar: req.body.title_ar });
    let title_en = await myService.findOne({ title_en: req.body.title_en });
    if (title_ar) return res.status(400).send(`That Title : ${title_ar.title_ar} Alryed Exited With Us `);
    if (title_en) return res.status(400).send(`That Title : ${title_en.title_en} Alryed Exited With Us `);
    let myservice = await myService.findByIdAndUpdate(req.params.id, {
        title_ar: req.body.title_ar,
        title_en: req.body.title_en,
        des_ar: req.body.des_ar,
        des_en: req.body.des_en,
        salary: req.body.salary,
        keywords: req.body.keywords
    });
    if (!myservice) return res.status(404).send("invalid myServices ");
    myservice = await myservice.save()
    res.send(myservice)
});
router.delete('/:id', [auth, admin], async(req, res, next) => {

    const myservice = await myService.findByIdAndDelete(req.params.id);
    if (!myservice) return res.status(404).send("invalid myServices ");
    res.send('done well, the myServices was deleted successfully');
});
router.get('/:id', async(req, res) => {
    const myservice = await myService.findById(req.params.id);
    if (!myservice) return res.status(404).send("invalid myServices");
    res.send(myservice);
})
router.put('/avatar/:id', [auth, admin, type], async(req, res) => {
    const { error } = validateAvatar(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const avatar = await myService.findByIdAndUpdate(req.params.id);
    if (!avatar) return res.status(404).send("The myService Can't Found Can You trying again")
    avatar.set({
        avatar: req.file.path
    })
    res.status(200).send(avatar);
    avatar.save()
});
module.exports = router;