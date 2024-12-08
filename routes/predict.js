const express = require('express');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const { v4: uuidv4 } = require('uuid');
const { saveToFirestore } = require('../services/firestore');

const router = express.Router();
const upload = multer({
  limits: { fileSize: 1000000 }, // Maksimal 1MB
});

let model;

// Fungsi untuk memuat model saat server dimulai
(async () => {
  model = await tf.loadLayersModel('file://model/model.json');
  console.log('Model loaded successfully');
})();

// Endpoint untuk prediksi
router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    // Validasi: Jika file tidak ada
    if (!file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded',
      });
    }

    // Convert file gambar ke Tensor
    const tensor = tf.node
      .decodeImage(file.buffer, 3) // Decode buffer gambar
      .resizeNearestNeighbor([224, 224]) // Resize ke 224x224
      .expandDims() // Tambah dimensi batch
      .toFloat()
      .div(255.0); // Normalisasi nilai piksel (0-1)

    // Prediksi menggunakan model
    const predictions = model.predict(tensor).dataSync();
    const result = predictions[0] > 0.5 ? 'Cancer' : 'Non-cancer';
    const suggestion = result === 'Cancer'
      ? 'Segera periksa ke dokter!'
      : 'Penyakit kanker tidak terdeteksi.';

    // Data respons
    const responseData = {
      id: uuidv4(),
      result,
      suggestion,
      createdAt: new Date().toISOString(),
    };

    // Simpan ke Firestore
    await saveToFirestore(responseData);

    // Kirim respons sukses
    res.status(200).json({
      status: 'success',
      message: 'Model is predicted successfully',
      data: responseData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Terjadi kesalahan dalam melakukan prediksi',
    });
  }
});

module.exports = router;
