// Prints a strong random ENCRYPTION_KEY. Run:  node scripts/gen-key.js
console.log('\nENCRYPTION_KEY=' + require('crypto').randomBytes(48).toString('hex'));
console.log('\nSave this somewhere safe (password manager). If you lose it, stored files can never be decrypted.\n');
