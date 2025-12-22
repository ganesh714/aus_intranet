import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import connectDB from "./config/db.js";
import routes from "./routes/routes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api", routes);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on ${port}`));
