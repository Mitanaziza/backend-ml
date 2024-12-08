const express = require('express');
const predictRoute = require('./routes/predict');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use('/predict', predictRoute);

// Jalankan server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
