const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/user");
const cors = require("cors");
const app = express();
// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());

app.use("/api/users", userRoutes);
 const mongoURI = 'mongodb+srv://hamzashafqat098:kb2n699ZEpOnbnF0@chattersynccluster.4hi9pqo.mongodb.net/ChatterSyncDB?retryWrites=true&w=majority&appName=ChatterSyncCluster';


mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
