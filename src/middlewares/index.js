const secret = process.env.AUTH_SECRET;
const jwt = require("jsonwebtoken");

module.exports = {
  async decodeUserToken(req, res, next) {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).send({ error: "Unauthorized" });

    const decodedToken = jwt.decode(authorization, secret);

    if (!decodedToken) return res.status(401).send({ error: "Unauthorized" });

    req.userData = decodedToken;
    next();
  },
};

