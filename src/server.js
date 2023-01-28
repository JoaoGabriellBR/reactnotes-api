const express = require("express");
const routes = require('./routes');
const app = express();

app.use(express.json({limit: '30mb'}));
app.use(routes);

app.listen({ port: 3002 });
console.clear();
console.log("Running...");
