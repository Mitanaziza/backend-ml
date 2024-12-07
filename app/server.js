const express = require('express');
const multer = require('multer');
const uuid = require('uuid');
const tf = require('@tensorflow/tfjs-node');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
const upload = multer({ limits: { fileSize: 1000000 } }); // Max file size 1MB

// Load TensorFlow model
let model;
(async () => {
    model = await tf.loadLayersModel('file://model/model.json');
})();

// Prediction Endpoint
app.post('/predict', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
        }

        // Preprocess image for prediction
        const imageBuffer = req.file.buffer;
        const tensor = tf.node.decodeImage(imageBuffer).resizeNearestNeighbor([224, 224]).expandDims(0);
        const prediction = model.predict(tensor).dataSync()[0];

        const result = prediction > 0.5 ? 'Cancer' : 'Non-cancer';
        const suggestion = result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.';
        const id = uuid.v4();
        const createdAt = new Date().toISOString();

        res.status(200).json({
            status: 'success',
            message: 'Model is predicted successfully',
            data: { id, result, suggestion, createdAt },
        });
    } catch (error) {
        res.status(400).json({ status: 'fail', message: 'Terjadi kesalahan dalam melakukan prediksi' });
    }
});

// Error Handling
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000',
        });
    }
    res.status(500).send('Internal Server Error');
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
