var express = require('express');
var router = express.Router();
var multer = require('multer');
const config = require('config');
const _ = require('lodash');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { User, validateUser, validateUserUpdate, validateUserEmail, validateUserPassword, Feedback, } = require('../model/users');
const { check, validationResult } = require('express-validator');
require('express-async-errors');
const mailgun = require("mailgun-js");
const { env } = require('process');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DOMAIN = 'sandbox9c5fdd51b0e54b41882ee50a4cf6597d.mailgun.org';
apiKey = "3ce55f4faf86fe4c87c6686d153d6e2b-f7d0b107-9250c54a"
const mg = mailgun({ apiKey: apiKey, domain: DOMAIN });
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
router.post('/', async(req, res) => {
    const { email, password, phone, name, address, facebook, twitter, google, linkedin, instagram, actvition, avatar, date } = req.body
    const { error } = validateUser(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let user = await User.findOne({ email: email })
    if (user) return res.status(400).send({ error_en: "that user already  registered", error_ar: "هذا المستخدم مسجل بالفعل" });
    let nameUser = await User.findOne({ name: name });
    if (nameUser) return res.status(400).send({ error_en: "that name already exist", error_ar: "هذا الاسم موجود بالفعل" });
    users = new User({ email, password, phone, name, address, facebook, twitter, google, linkedin, instagram, actvition, avatar, date })
    const token = users.generaToken()
    users.save((err) => {
        if (err) {
            res.status(400).send({ error_en: "please enter vaild data", error_ar: "الرجاء إدخال بيانات صحيحة", error: "please enter vaild data" })
        } else {
            res.header('x-auth-token', token).send({ message_ar: "تم إرسال البريد الإلكتروني ، يرجى تفعيل حسابك ، والتحقق من صندوق بريدك الإلكتروني", message_en: "Email has been sent , kindly activate your account , chack your email inbox" })
            const data = {
                from: 'alqaqaacompany@gmail.com',
                to: email,
                subject: 'Accont Actvition Link',
                html: `
                        <h2>please click on given link to activate you account</h2>
                        <a>http://localhost:5000/api/users/activate/${token}</a>
        
                `
            };
            mg.messages().send(data, (err, body) => {
                if (err) {
                    res.send({ error: err.message })
                }
            });
        }
    })
});
router.post('/resendMessage', auth, async(req, res) => {
    try {
        const { email } = req.body
        const { error } = validateUserEmail(req.body);
        if (error) return res.status(404).send(error.details[0].message);
        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ erorr_en: `That email INVALID`, error_ar: `هذا البريد الإلكتروني غير صالح` });
        const token = jwt.sign({ email }, config.get('jwtPrivatKey'), { expiresIn: "20m" })
        if (token) {
            const data = {
                from: 'alqaqaacompany@gmail.com',
                to: email,
                subject: 'Accont Actvition Link',
                html: `
                        <h2>please click on given link to activate you account</h2>
                        <a>http://localhost:5000/api/users/activate/${token}</a>
        
                `
            };
            mg.messages().send(data, (err, body) => {
                if (err) {
                    res.send({ error: err.message })
                } else {
                    res.send({ message_en: "The link was resubmitted, the link will be invalid 20 minutes from now", message_ar: "تم إعادة إرسال الرابط ، سيكون الرابط غير صالح بعد 20 دقيقة من الآن" })
                }
            });
        } else {
            res.status(400).send({ error_en: "something is rwong!!!", error_ar: "هناك شئ غير صحيح !!!" })
        }
    } catch (err) {
        return res.status(400).send({ message_en: 'invlid TOKEN', message_ar: 'رمز غير صالح' });

    }

})
router.put('/activate/:token', async(req, res) => {
    const { token } = req.params
    if (token) {
        jwt.verify(token, config.get('jwtPrivatKey'), function(err, decoded) {
            if (err) {
                res.status(404).send({ error: err.message })
            }
            User.findOne({ email: decoded.email }, (err, user) => {
                if (err || !user) {
                    return res.status(400).send({ error_en: "User with this email does not exists.", error_ar: "المستخدم بهذا البريد الإلكتروني غير موجود." })
                }
                const obj = {
                    verify: true,
                }
                user = _.extend(user, obj)
                user.save((err, resullt) => {
                    if (err) {
                        return res.status(400).send({ error_en: "Link activate the email by mistake ", error_ar: "لينك تفعيل الايميل خطا" })

                    } else {
                        return res.status(200).send({ message_en: " Your Email has been Activated ", message_ar: " تم تفعيل بريدك الإلكتروني" })
                    }
                })
            })
        })
    } else {
        return res.send({ error: "something went wrong!!!" })
    }
})
router.put('/forget-password/', async(req, res) => {
    const { email } = req.body;
    const { error } = validateUserEmail(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).send({ error_en: "User with this email does not exists.", error_ar: "المستخدم بهذا البريد الإلكتروني غير موجود." })
        }
        const token = jwt.sign({ _id: user._id }, config.get('REST_PASSWORD_KEY'), { expiresIn: '30m' })
        const data = {
            from: 'alqaqaacompany@gmail.com',
            to: email,
            subject: 'Accont Forget Password Link',
            html: `
                <h2>please click on given link to reset your password</h2>
                <a>http://localhost:5000/api/users/reset-password/${token}</a>

        `
        };
        return user.updateOne({ resetLink: token }, (err, success) => {
            if (err) {
                return res.status(400).send({ error_en: "Reset password link wrong ", error_ar: "رابط اعادة تعين كلمة المرور خطا" })

            } else {
                mg.messages().send(data, async(err, body) => {
                    if (err) {
                        res.send({ error: err.message })
                    } else {
                        return res.json({ message_en: "Email has been sent , kindly  follow the instruction , chack your inbox  ", message_ar: "تم إرسال البريد الإلكتروني ، يرجى اتباع التعليمات ، والتحقق من صندوق الوارد الخاص بك " })

                    }
                });
            }
        })
    })
})
router.put('/reset-password/:resetLink', async(req, res) => {
    const { resetLink } = req.params;
    const { newPass } = req.body;
    if (resetLink) {
        jwt.verify(resetLink, config.get('REST_PASSWORD_KEY'), (err, decoded) => {
            if (err) {
                return res.status(401).send({ error_en: "incorrect token or it is expierd.", error_ar: "رابط غير صحيح أو انتهت صلاحيته." })
            }
            User.findOne({ resetLink }, (err, user) => {
                const { error } = validateUserPassword(req.body);
                if (error) return res.status(404).send(error.details[0].message);
                if (user != null) {
                    if (user.password === newPass)
                        return res.status(400).send({ error_en: "please change your password do not change your password like your old password.", error_ar: "الرجاء تغيير كلمة المرور الخاصة بك لا تغير كلمة المرور الخاصة بك مثل كلمة المرور القديمة." })
                } else {
                    res.status(400).send({ error_en: "This Link Is Invalid", error_ar: "هذا الرابط غير صالح" })
                }
                const obj = {
                    password: newPass,
                    resetLink: ""
                }
                user = _.extend(user, obj)
                user.save((err, resullt) => {
                    if (err) {
                        return res.status(400).send({ error_en: "reset password link error ", error_ar: "  الرجاء ادخال بيانات صالحه." })

                    } else {
                        const data = {
                            from: 'alqaqaacompany@gmail.com',
                            to: user.email,
                            subject: 'Accont change password',
                            html: `
                                    <h2>Your password has been changed , You know it ?</h2>
                            `
                        };
                        mg.messages().send(data, async(err, body) => {
                            if (err) {
                                res.send({ error: err.message })
                            }
                        });

                        return res.status(200).send({ message_en: " Your password has been changed ", message_ar: " تم تغيير كلمة السر الخاصة بك " })

                    }
                })
            })

        })
    } else {
        return res.status(401).json({ error_en: "Authentication error!!!", error_ar: "خطأ مصادقة!!!" })
    }
})
router.post('/feedback', async(req, res) => {
    const { error } = Feedback(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    const { email, subject, des, name } = req.body
    const data = {
        from: 'alqaqaacompany@gmail.com',
        to: email,
        subject: subject,
        html: `        
       <h1>subject:${subject}</h1>
       <h2>name:${name}</h2>
     <h3>Description:${des}</h3>`,
    };
    mg.messages().send(data, async(err, body) => {
        if (err) {
            res.send({ error: err.message })
        }
    });
    res.send({
        message_en: "Your message has been sent thanks",
        message_ar: "تم إرسال رسالتك شكرا"
    })
});
router.put('/change-password', auth, async(req, res) => {
    try {
        const { password, newPass } = req.body
        const { error } = validateUserPassword(req.body);
        if (error) return res.status(404).send(error.details[0].message);
        const user = await User.findOne({ _id: req.user._id }, async(err, user) => {
            const oldPass = await user.password === password
            if (!oldPass) return res.status(400).send({ error_en: `The old password is wrong. Try again and verify that the old password is correct`, error_ar: `كلمة المرور القديمة خاطئة. حاول مرة أخرى وتحقق من صحة كلمة المرور القديمة` });
            if (err || !user) {
                return res.status(400).send({ error: "User with this token  does nt exists." })
            } else {
                if (password === newPass)
                    return res.status(400).send({ error_en: "please change your password do not change your password like your old password.", error_ar: "الرجاء تغيير كلمة المرور الخاصة بك لا تغير كلمة المرور الخاصة بك مثل كلمة المرور القديمة." })

                const obj = {
                    password: newPass
                }
                user = _.extend(user, obj)
                user.save((err) => {
                    if (err) {
                        return res.status(400).send({ error_en: "somthing rwong !!!!!", error_ar: "هناك خطأ ما !!!!!" })
                    } else {
                        return res.json({ message_en: " Your password has been changed ", message_ar: "تم تغيير كلمة السر الخاصة بك " })
                    }
                })
            }
        });
    } catch (err) {
        throw err
    }
})
router.get('/me', auth, async(req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
})
router.get('/adminusers/:id', async(req, res) => {
    const user = await User.findById(req.params.id).select('-password').sort('date');
    res.send(user);
})
router.put('/me', auth, async(req, res) => {
    const { error } = validateUserUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const user = await User.findByIdAndUpdate(req.user._id);
    user.set({
        phone: req.body.phone,
        name: req.body.name,
        address: req.body.address,
    })
    user.save((err) => {
        if (err) throw err
    })
    res.status(200).send(user);
});
router.put('/admin/:id', [auth, admin], async(req, res) => {
    const { error } = validateUserUpdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let userEmail = await User.findOne({ email: req.body.email });
    if (userEmail) return res.status(400).send(`that email alryed registered`);
    let name = await User.findOne({ name: req.body.name });
    if (name) return res.status(400).send(`that name alryed exited`);
    const user = await User.findByIdAndUpdate(req.params.id);
    user.set({
        phone: req.body.phone,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
    })
    user.save((err) => {
        if (err) throw err
    })
    res.status(200).send(user);
});

router.get('/', [auth, admin], async(req, res) => {
    const users = await User.find().sort({ name: -1 });
    res.status(200).send({ users: users })
})
router.delete('/me', [auth, admin], async(req, res, next) => {
    try {
        const users = await User.findByIdAndDelete(req.body.id);
        if (!users) return res.status(404).send("invalid users ");
        res.send('done well, the user was deleted successfully');
    } catch (err) {
        next(err)
    }
});
router.put('/social/:id', auth, async(req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    const social = await User.findByIdAndUpdate(req.user._id);
    if (!social) return res.status(404).send("The User Can't Found Can You trying again")
    social.set({
        facebook: req.body.facebook,
        google: req.body.google,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
        linkedin: req.body.linkedin
    })
    res.status(200).send(social);
    social.save();
});
router.put('/avatar/:id', [auth, type], async(req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const avatar = await User.findByIdAndUpdate(req.params.id);
    if (!avatar) return res.status(404).send("The User Can't Found Can You trying again")
    avatar.set({
        avatar: req.file.path
    })
    res.status(200).send({ avatar: avatar });
    avatar.save()
});
// router.post('/orders', [auth], async (req, res) => {
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     const oreders = await myService.findById(req.body.oredersId);
//     if (!oreders) return res.status(404).send("The oreders Can't Found Can You trying again")
//     const user = await User.update(
//         { _id: req.user._id },
//         {
//             $push: {
//                 oreders: {
//                     $each: [oreders],

//                     $slice: 1
//                 }
//             }
//         })
//     if (!user) return res.status(404).send("The user Can't Found Can You trying again");
//     res.status(200).send({ user: user })
// });
// router.delete('/orders', [auth], async (req, res) => {
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     const oreders = await myService.findById(req.body.oredersId);
//     if (!oreders) return res.status(404).send("The oreders Can't Found Can You trying again")
//     const user = await User.update({ _id: req.user._id },
//         { $pull: { oreders: { $in: [oreders] } } })
//     if (!user) return res.status(404).send("The user Can't Found Can You trying again");
//     res.status(200).send({ user: user })
// });
// router.post('/offers', [auth], async (req, res) => {
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     const offers = await Offers.findById(req.body.offersId);
//     if (!offers) return res.status(404).send("The offers Can't Found Can You trying again")
//     const user = await User.update(
//         { _id: req.user._id },
//         {
//             $push: {
//                 offers: {
//                     $each: [offers],
//                     $slice: 1
//                 }
//             }
//         })
//     if (!user) return res.status(404).send("The user Can't Found Can You trying again");
//     res.status(200).send({ user: user })
// });
// router.delete('/offers', [auth], async (req, res) => {
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     const offers = await Offers.findById(req.body.offersId);
//     if (!offers) return res.status(404).send("The offers Can't Found Can You trying again")
//     const user = await User.update({ _id: req.user._id },
//         { $pull: { offers: { $in: [offers] } } })
//     if (!user) return res.status(404).send("The user Can't Found Can You trying again");
//     res.status(200).send({ user: user })
// });
module.exports = router;