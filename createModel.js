const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

(async () => {
  // 1. Definisikan model (contoh model sederhana untuk klasifikasi binary)
  const model = tf.sequential();

  model.add(tf.layers.dense({
    inputShape: [2], // Input dengan dua fitur
    units: 16,
    activation: 'relu',
  }));

  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid', // Output untuk klasifikasi binary
  }));

  // 2. Kompilasi model
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  });

  // 3. Simulasi data pelatihan (dummy data)
  const xTrain = tf.tensor2d([[0, 0], [0, 1], [1, 0], [1, 1]]);
  const yTrain = tf.tensor2d([[0], [1], [1], [0]]);

  // 4. Latih model
  console.log('Training model...');
  await model.fit(xTrain, yTrain, {
    epochs: 100,
    verbose: 0, // Mengurangi log pelatihan
  });

  console.log('Training complete.');

  // 5. Simpan model ke dalam folder ./model
  const savePath = 'file://./model'; // Lokasi penyimpanan model
  await model.save(savePath);
  console.log(`Model saved to ${savePath}`);
})();
