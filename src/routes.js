const express = require('express');
const routes = express.Router();

const User = require('./modules/User');

routes.get('/users', User.listUsers);
routes.get('/user/:id', User.getUser);
routes.post("/user", User.createUser);
routes.patch("/user/:id", User.updateUser);
routes.delete("/user/:id", User.deleteUser);

module.exports = routes;

