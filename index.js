require("dotenv").config();
const express = require("express");
const cors = require("cors");
const postRoutes = require("./routes/posts");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/posts", postRoutes); // Mount routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
