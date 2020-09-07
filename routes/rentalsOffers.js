const { Offers } = require('../model/ourOffers');
const { RentalsOffers, validetionRentalOffers, validetionRentalOffersUser } = require('../model/rentalsOffers');
const { User } = require('../model/users');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
var express = require('express');
var router = express.Router();
router.get('/', [auth], async(req, res) => {
    const rental = await RentalsOffers.find();
    res.send(rental);
});
router.post('', [auth], async(req, res) => {
    const { error } = validetionRentalOffersUser(req.body)
    if (error) return res.status(404).send(error.details[0].message)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("invalid user");
    const offers = await Offers.findByIdAndUpdate(req.body.offersId)
    if (!offers) return res.status(404).send("invalid Offers ")
    let rental = new RentalsOffers({
        user: user,
        offers: offers,
        address: req.body.addressOffers
    })
    rental.save((err) => {
        if (err) {
            res.status(400).send({ error_ar: 'الرجاء ادخال بيانات صالحه', error_en: "Please enter valid data" })
        } else {
            res.status(200).send({ rental: rental, message_en: "Submit the request to the service, we will talk you within 24 hours, saved the request on your profile", message_ar: "أرسل الطلب إلى الخدمة ، وسنتحدث معك في غضون 24 ساعة ، وحفظ الطلب في ملفك الشخصي" });
        }
    })
});
router.post('/addAdmin/', [auth, admin], async(req, res) => {
    const { error } = validetionRentalOffers(req.body)
    if (error) return res.status(404).send(error.details[0].message)
    const user = await User.find({ email: req.body.user });
    if (!user) return res.status(404).send("invalid user");
    const userId = user[0]._id;
    const offers = await Offers.findById(req.body.offersId)
    if (!offers) return res.status(404).send("invalid Offers")
    let rental = new RentalsOffers({
        user: userId,
        offers: offers,
        address: req.body.address,
        status: req.body.status,
    })
    res.status(200).send({ rental: rental, message: "done send the request " });
    rental.save()
});
router.get('/orders', [auth], async(req, res) => {
    const rentalsOffers = await RentalsOffers.find({ user: req.user._id });
    if (!rentalsOffers) return res.status(404).send("The rentalsOffers with the Given ID was not found ");
    res.json(rentalsOffers)
});
router.get('/ordersAdmin/:id', [auth, admin], async(req, res) => {
    const rentalsOffers = await RentalsOffers.find({ user: req.params.id });
    if (!rentalsOffers) return res.status(404).send("The rentalsOffers with the Given ID was not found ");
    res.json(rentalsOffers)
});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validetionRentalOffers(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let rentalsOffers = await RentalsOffers.findByIdAndUpdate(req.params.id, {
        address: req.body.address,
        status: req.body.status,
    });
    if (!rentalsOffers) return res.status(404).send("invalid rentalsOffers ");
    await rentalsOffers.save()
    res.send(rentalsOffers)
});
router.get('/:id', [auth], async(req, res) => {
    const rentalsOffers = await RentalsOffers.findById(req.params.id);
    if (!rentalsOffers) return res.status(404).send("invalid rentalsOffers");
    res.send(rentalsOffers);
});
router.delete('/:id', [auth], async(req, res, next) => {
    const rentalsOffers = await RentalsOffers.findByIdAndDelete(req.params.id);
    if (!rentalsOffers) return res.status(404).send("invalid rentalsOffers ");
    res.send({ message: 'done well, the offer was deleted successfully', message_en: 'done well, the offer was deleted successfully', message_ar: 'أحسنت ، تم حذف العرض بنجاح' });
});
module.exports = router;