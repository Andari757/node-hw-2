const bcrypt = require("bcrypt");
const express = require('express');
const jwt = require("jsonwebtoken");
const gravatar = require('gravatar');
const path = require("path");
const fs = require("fs/promises");
const {nanoid} = require("nanoid")

const jimp = require('jimp');

const sendMail = require("../../helpers/sendMail")
const uploadAvatar = require('../../middlewares/upload-avatar');
const authorize = require("../../middlewares/authorize");
const User = require('../../models/user');

const router = express.Router();
const key = "123456";

router.post('/signup', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!password) {
            res.status(400);
            res.json({
                "message": "user validation failed: password: Password is required"
            });
            return;
        }
        const user = await User.findOne({ email });
        if (user) {
            res.status(409);
            res.json({
                "message": "Email in use"
            });
            return;
        };


        const hashPassword = await bcrypt.hash(password, 10);
        const avatarURL = gravatar.url(email);
        const verificationToken=nanoid();
        await User.create({ email, avatarURL, password: hashPassword, verificationToken });
        const mail = {
            to:email,
            subject: "verify ur email",
            html: `<a href="http://localhost:3000/api/users/verify/${verificationToken}"> please verify your email</a>`
            };
        await sendMail(mail);

        res.status(201);
        res.json({
            user: {
                email,
                subscription: "starter",
                avatarURL,
            }
        });
    } catch (e) {
        next(e);
    };
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            res.status(401);
            res.json({
                "message": "Email or password is wrong"
            });
            return;
        };
        if (!user.verify) {
            res.status(401);
            res.json({
                "message": "Email not verified"
            });
            return;
        };
        if (!user || !await bcrypt.compare(password, user.password)) {
            res.status(401);
            res.json({
                "message": "Email or password is wrong"
            });
            return;
        };
        const payload = { id: user.id };
        const token = jwt.sign(payload, key);
        Object.assign(user, { token: token });
        user.save();
        res.status(200);
        res.json({
            token: token,
            user: {
                email: user.email,
                subscription: user.subscription
            }
        });
    } catch (e) {
        next(e);
    };
});

router.get("/logout", authorize, async (req, res, next) => {
    try {
        const { _id } = req.user;
        const user = await User.findByIdAndUpdate(_id, { token: "" }, { new: true });
        if (!user) {
            res.status(401);
            res.json({
                "message": "Not authorized"
            });
        } else {
            res.status(204);
        }
    } catch (e) {
        next(e)
    }
});

router.get("/current", authorize, async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200);
        res.json({
            email: user.email,
            subscription: user.subscription
        });
    } catch (e) {
        next(e)
    }
});
const avatarsDir = path.join(__dirname, "../../", "public", "avatars");
router.patch("/avatars", authorize, uploadAvatar.single("avatar"), async(req, res, next)=> {
    const {_id} = req.user;
    
    try {
        const {path: tempUpload, filename} = req.file;        
        const parts = filename.split('.');
        const extension = parts[parts.length - 1];           
        const newFileName = `${_id}.${extension}`;
        const resultUpload = path.join(avatarsDir, newFileName);
        await fs.rename(tempUpload, resultUpload);
        const avatarURL = path.join("avatars", newFileName);
        await User.findByIdAndUpdate(_id, {avatarURL});  
        const image = await jimp.read(resultUpload);
        image.resize(250,250, function(err){
        if (err) throw err;
        })
        res.json({
            avatarURL
        })
    } catch (error) {
        next(error);
    }
});

router.get("/verify/:verificationToken", async (req, res, next) => {
    try {
        const {verificationToken}=req.params;
        const user = await User.findOne({verificationToken});
        if(!user){res.status(404);
            res.json({
                "message": 'User not found'
            })
        }else{       
        await User.findByIdAndUpdate(user._id,{verificationToken:"",verify:"true"})
        res.status(200);
        res.json({
            "message": 'Verification successful',
        })
        }
    } catch (e) {
        next(e)
    }
});

router.post("/verify", async (req, res, next) => {
    try {
        const { email } = req.body;
        if(!email){
            res.status(400);
            res.json(
                {"message": "missing required field email"}
            );
            return
        };
        const user = await User.findOne({email});
        if (!user) {
            res.status(401);
            res.json({
                "message": "user not found"
            });
            return;
        };
        if (user.verify) {
            res.status(400 );
            res.json({
                "message": "Verification has already been passed"
            });
            return;
        };
        const mail = {
            to:email,
            subject: "verify ur email",
            html: `<a href="http://localhost:3000/api/users/verify/${user.verificationToken}"> please verify your email</a>`
            };
        await sendMail(mail);
        res.status(200  );
            res.json({
                "message": "Verification email sent"
            });
    } catch (e) {
        next(e);
    };
});

module.exports = router;