const bcrypt = require("bcrypt");
const express = require('express');
const router = express.Router();
const User = require('../../models/user');

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

    } catch (e) {
        next(e)
    };
})

module.exports = router;