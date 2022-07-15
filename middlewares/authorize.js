const jwt = require("jsonwebtoken");
const User = require("../models/user")

const key = "123456"

const authorize = async (req, res, next) => {
    try {
        const { authorization = "" } = req.headers;
        const [bearer, token] = authorization.split(" ");
        if (bearer !== "Bearer") {
            res.status(401);
            res.send("not ");
        }
        try {
            const { id } = jwt.verify(token, key);
            const user = await User.findById(id);
            if (!user) {
                res.status(401);
                res.send("not ");
            }
            req.user = user;
            next();
        } catch (e) { next(e) }

    } catch (e) {
        next(e)
    }
}
module.exports = authorize;