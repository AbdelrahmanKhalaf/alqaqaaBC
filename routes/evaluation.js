var express = require('express');
var router = express.Router();
const { Evaluation, validateEvaluation } = require('../model/evaluation');
const { schemaUser, User } = require('../model/users');
require('express-async-errors');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
router.get('/', async(req, res) => {
    const evaluation = await Evaluation.find().sort('name');
    res.send(evaluation);

});
router.post('/', [auth], async(req, res) => {
    const { error } = validateEvaluation(req.body);
    const users = await User.findByIdAndUpdate(req.user._id);
    if (!users) return res.status(404).send("invalid user");
    if (error) return res.status(400).send(error.details[0].message);
    let user = await Evaluation.findOne({ user: req.user._id });
    if (user) return res.status(400).send({ error_en: `You Already Commented`, error_ar: 'لقد علقت بالفعل' });
    let evaluation = new Evaluation({
        comment: req.body.comment,
        user: users,
        date: req.body.date
    });
    evaluation = await evaluation.save((err) => {
        if (err) {
            res.status(400).send({ error_en: "please enter vaild data", error_ar: "الرجاء إدخال بيانات صحيحة" })
        }
    })
    res.send(evaluation);
});
router.put('/:id', [auth, admin], async(req, res) => {
    const { error } = validateEvaluation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let evaluation = await Evaluation.findByIdAndUpdate(req.params.id, {
        comment: req.body.comment,

    });
    if (!evaluation) return res.status(404).send("invalid evaluation ");
    evaluation = await evaluation.save()
    res.send(evaluation)
});
router.delete('/:id', [auth, admin], async(req, res, next) => {

    const evaluation = await Evaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) return res.status(404).send("invalid evaluation ");
    res.send({ message: 'done well, the evaluation was deleted successfully' });
});
router.get('/:id', async(req, res) => {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).send("invalid evaluation");
    res.send(evaluation);
})
module.exports = router;