const express = require("express");
const routes = express.Router();

const User = require("./modules/User");
const Notes = require("./modules/Notes");

const { decodeUserToken } = require("./middlewares");

routes.get("/users", decodeUserToken, User.listUsers);
routes.get("/user", decodeUserToken, User.getUser);
routes.post("/user", User.createUser);
routes.patch("/user/:id", decodeUserToken, User.updateUser);
routes.delete("/user/:id", decodeUserToken, User.deleteUser);
routes.post("/login", User.login);

routes.get("/note/:id", decodeUserToken, Notes.getNote);
routes.get("/notes", decodeUserToken, Notes.listNotes);
routes.post("/note", decodeUserToken, Notes.createNote);
routes.patch("/note/:id", decodeUserToken, Notes.updateNote);
routes.delete("/note/:id", decodeUserToken, Notes.deleteNote);

module.exports = routes;
