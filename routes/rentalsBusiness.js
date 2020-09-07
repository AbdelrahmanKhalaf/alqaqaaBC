const { Business } = require('../model/business');
const { RentalsBusiness, validetionRentalBusiness } = require('../model/rentalsBusinesses');
const { User } = require('../model/users');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
var express = require('express');
var router = express.Router();
router.get('/', [auth, admin], async(req, res) => {
    const rental = await RentalsBusiness.find();
    res.send(rental);
});
router.post('/', [auth, ], async(req, res) => {
    const { error } = validetionRentalBusiness(req.body)
    if (error) return res.status(404).send(error.details[0].message)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).send("invalid user");
    const business = await Business.findById(req.body.businessId)
    if (!business) return res.status(400).send("invalid Business")
    let rental = new RentalsBusiness({
        user: user,
        business: business,
        address: req.body.address,

    })
    res.status(200).send({ rental: rental, message_en: "Submit the request to the service, we will talk you within 24 hours, saved the request on your profile", message_ar: "أرسل الطلب إلى الخدمة ، وسنتحدث معك في غضون 24 ساعة ، وحفظ الطلب في ملفك الشخصي" });
    rental.save((err) => {
        if (err) {
            res.status(200).send({ error_ar: 'الرجاء ادخال بيانات صالحه', error_en: "Please enter valid data" })
        }
    })
});
router.post('/addAdmin/', [auth, admin], async(req, res) => {
    const { error } = validetionRentalBusiness(req.body)
    if (error) return res.status(404).send(error.details[0].message)
    const user = await User.find({ email: req.body.user });
    if (!user) return res.status(400).send("invalid user");
    const userId = user[0]._id;
    const business = await Business.findById(req.body.businessId)
    if (!business) return res.status(400).send("invalid Business")
    let rental = new RentalsBusiness({
        user: userId,
        business: business,
        address: req.body.address,
        status: req.body.status,
    })
    res.status(200).send({ rental: rental, message: "done send the request " });
    rental.save()
});
router.get('/orders', [auth], async(req, res) => {
    const rentalsBusinesses = await RentalsBusiness.find({ user: req.user._id });
    if (!rentalsBusinesses) return res.status(404).send("The rentalsBusiness with the Given ID was not found ");
    res.json(rentalsBusinesses)
});
router.get('/ordersAdmin/:id', [auth, admin], async(req, res) => {
    const rentalsBusinesses = await RentalsBusiness.find({ user: req.params.id });
    if (!rentalsBusinesses) return res.status(404).send("The rentalsBusiness with the Given ID was not found ");
    res.json(rentalsBusinesses)
});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validetionRentalBusiness(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let rentalsBusiness = await RentalsBusiness.findByIdAndUpdate(req.params.id, {
        address: req.body.address,
        status: req.body.status,
    });
    if (!rentalsBusiness) return res.status(404).send("invalid rentalsBusiness ");
    await rentalsBusiness.save()
    res.send(rentalsBusiness)
});
router.get('/:id', [auth], async(req, res) => {
    const rentalsBusiness = await RentalsBusiness.findById(req.params.id);
    if (!rentalsBusiness) return res.status(404).send("invalid rentalsBusiness");
    res.send(rentalsBusiness);
});
router.delete('/:id', [auth, ], async(req, res, next) => {
    const rentalsBusinesses = await RentalsBusiness.findByIdAndDelete(req.params.id);
    if (!rentalsBusinesses) return res.status(404).send("invalid rentalsOffers");
    res.send({ message: 'done well, the order was deleted successfully', message_en: 'done well, the order was deleted successfully', message_ar: 'أحسنت ، تم حذف الطلب بنجاح' });
});
module.exports = router;