const crypto = require('crypto');
const fs = require('fs');

// เข้ารหัสแบบใช้ callback เมื่อเสร็จ
function encryptFile(inputPath, outputPath, key, iv, callback) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.pipe(cipher).pipe(output);

  // รอให้เขียนเสร็จก่อนค่อย callback
  output.on('finish', () => {
    callback(null); // ไม่มี error
  });

  output.on('error', (err) => {
    callback(err);
  });
}

module.exports = { encryptFile };
