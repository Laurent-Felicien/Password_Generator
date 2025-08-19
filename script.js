// Constantes
const generateBtn = document.getElementById("btn-generate");
const copyBtn = document.getElementById("btn-copy");
const passwordInput = document.getElementById("password");

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:'\",.<>/?\\|`~";
const PASSWORD_LENGTH = 12;

/**
 * Génère un mot de passe aléatoire
 * @param {number} length - Longueur du mot de passe
 * @returns {string} - Mot de passe généré
 */
function generatePassword(length = PASSWORD_LENGTH) {
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CHARS.length);
        password += CHARS[randomIndex];
    }
    return password;
}

// Génération manuelle
generateBtn.addEventListener("click", () => {
    passwordInput.value = generatePassword();
});

// Copier dans le presse-papiers
copyBtn.addEventListener("click", () => {
    if (passwordInput.value) {
        navigator.clipboard.writeText(passwordInput.value);
        alert("Mot de passe copié !");
    }
});
