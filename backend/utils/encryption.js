const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.AES_SECRET_KEY || 'SecureEHR_AES256_Key_2026_MoH_LK';

// Key must be exactly 32 bytes for AES-256
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

// Encrypt file data
const encryptFile = (base64Data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(base64Data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Store IV with encrypted data (needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt file data
const decryptFile = (encryptedData) => {
  // Handle old records stored as plain Base64 (before encryption was added)
  if (!encryptedData.includes(':')) {
    return encryptedData;
  }

  const parts = encryptedData.split(':');
  if (parts.length < 2) {
    return encryptedData;
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encryptFile, decryptFile };