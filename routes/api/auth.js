const bcrypt = require("bcrypt");
const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require('../../models/user');
const authorize = require("../../middlewares/authorize")

const key = "123456"

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
        await User.create({ email, password: hashPassword });
        res.status(201);
        res.json({
            user: {
                email: email,
                subscription: "starter"
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
module.exports = router;