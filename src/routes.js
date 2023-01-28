const express = require('express');
const routes = express.Router();
const User = require('./modules/User');

const { decodeUserToken } = require('./middlewares');

routes.get("/users", decodeUserToken, User.listUsers);
routes.get("/user/:id", decodeUserToken, User.getUser);
routes.post("/user", User.createUser);
routes.patch("/user/:id", decodeUserToken, User.updateUser);
routes.delete("/user/:id", decodeUserToken, User.deleteUser);

module.exports = routes;

