// generate-hash.js
const bcrypt = require("bcryptjs");

const password = "Netflix69";
const saltRounds = 10; // El estándar de la industria

bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error("Error al generar el hash:", err);
    return;
  }
  console.log(`¡Copia y pega este hash en tu archivo .env.local!`);
  console.log(`Tu nuevo hash es: ${hash}`);
});
