var express = require('express');
var router = express.Router();
const { Service, validateService } = require('../model/services');
require('express-async-errors');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
router.get('/', async(req, res) => {
    const service = await Service.find().sort('name');
    res.send(service);
});
router.post('/', [auth, admin], async(req, res) => {
    const { error } = validateService(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let services_ar = await Service.findOne({ name_ar: req.body.name_ar });
    let services_en = await Service.findOne({ name_en: req.body.name_en });
    if (services_ar) return res.status(400).send(`that name alryed added`);
    if (services_en) return res.status(400).send(`that name alryed added`);
    let service = new Service({
        name_ar: req.body.name_ar,
        name_en: req.body.name_en,
        date: req.body.date
    })
    service = await service.save()
    res.send({ ctgService: service, message: "Add Catg Services Successfully" });
});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validateService(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let services_ar = await Service.findOne({ name_ar: req.body.name_ar });
    let services_en = await Service.findOne({ name_en: req.body.name_en });
    if (services_ar) return res.status(400).send(`that name alryed added`);
    if (services_en) return res.status(400).send(`that name alryed added`);
    let service = await Service.findByIdAndUpdate(req.params.id, { name_ar: req.body.name_ar, name_en: req.body.name_en });
    if (!service) return res.status(404).send("invalid service ");
    service = await service.save()
    res.send(service)
});
router.delete('/:id', [auth, admin], async(req, res, next) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).send("invalid service ");
        res.send({ message: 'done well, the service was deleted successfully' });
    } catch (err) {
        next(err)
    }
});
router.get('/:id', async(req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).send("invalid service");
    res.send(service);
})
module.exports = router;