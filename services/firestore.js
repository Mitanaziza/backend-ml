const admin = require('firebase-admin');
require('dotenv').config();

// Inisialisasi Firestore
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

// Fungsi untuk menyimpan data prediksi
async function saveToFirestore(data) {
  const docRef = db.collection('predictions').doc(data.id);
  await docRef.set(data);
}

module.exports = { saveToFirestore };
