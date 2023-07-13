const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());

app.use(express.json({ limit: "50mb" }));
app.use(routes);

app.listen({ port: 3003 });
console.clear();
console.log("🚀 the Server is Running...");
