
const { User } = require('../model/users');
const { Business } = require('../model/business');
const { Offers } = require('../model/ourOffers');
const { Rentals,validetionRental } = require('../model/rentals');
const auth = require('../middleware/auth');
var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
router.get('/', async (req, res) => {
    const rental = await Rentals.find().sort('title');
    res.send(rental);
});
router.post('/business', [auth], async (req, res) => {
     const { error } = validetionRental(req.body)
     if (error) return res.status(400).send(error.details[0].message)
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("invalid user");   
  
    const business = req.body.businessId
    console.log(business);
    const Id = await []
    business.forEach(async doc => {
        const business = await Business.findById(doc)
        if (!business) return res.status(404).send("invalid business ")
        return Id.push(business)
        
    });
    setTimeout( () => {
        console.log(Id);
        let rental = new Rentals({
            user : user,
            business :Id,
        })
        res.status(200).send({ rental: rental });
        rental.save()

    }, 500);
});
router.post('/offers', [auth], async (req, res) => {
    const { error } = validetionRental(req.body)
    if (error) return res.status(400).send(error.details[0].message)
   const user = await User.findById(req.user._id);
   if (!user) return res.status(404).send("invalid user");   
   const servicesId = req.body.offersId
    const Id = await []
    servicesId.forEach(async doc => {
        const offers = await Offers.findByIdAndUpdate(doc)
        if (!offers) return res.status(404).send("invalid Offers ")

        return Id.push(offers)
        
    });
    setTimeout( () => {
        console.log(Id);
        let rental = new Rentals({
            user : user,
            offers :Id,
        })
        res.status(200).send({ rental: rental });
        rental.save()

    }, 500);
  
});
router.get('/orders',[auth], async (req, res) => {
    const rental = await Rentals.find({user:req.user._id});
    if (!rental) return res.status(404).send("The rental with the Given ID was not found ");
    res.json(rental)
});
module.exports = router;