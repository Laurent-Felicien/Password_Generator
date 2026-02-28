// ============================================================
// script.js — Password Generator v1.0.0
//
// Fonctionnalités :
//   - Génération de mot de passe avec options personnalisables
//     (longueur, majuscules, minuscules, chiffres, symboles)
//   - Indicateur de force du mot de passe
//   - Copie dans le presse-papiers avec feedback visuel
//   - Génération automatique au changement d'option
// ============================================================


// ============================================================
// RÉFÉRENCES DOM
// On récupère une seule fois les éléments HTML qu'on va utiliser.
// C'est plus performant que de les rechercher à chaque fois.
// ============================================================
const passwordInput  = document.getElementById("password");
const btnGenerate    = document.getElementById("btn-generate");
const btnCopy        = document.getElementById("btn-copy");
const lengthSlider   = document.getElementById("length-slider");
const lengthValue    = document.getElementById("length-value");
const strengthFill   = document.getElementById("strength-fill");
const strengthLabel  = document.getElementById("strength-label");
const iconCopy       = document.getElementById("icon-copy");
const iconCheck      = document.getElementById("icon-check");

// Options (cases à cocher)
const optUpper   = document.getElementById("opt-upper");
const optLower   = document.getElementById("opt-lower");
const optNumbers = document.getElementById("opt-numbers");
const optSymbols = document.getElementById("opt-symbols");


// ============================================================
// JEUX DE CARACTÈRES
// Chaque option correspond à un ensemble de caractères.
// On combine uniquement ceux qui sont cochés pour générer le mdp.
// ============================================================
const CHARS = {
  upper:   "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower:   "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?"
};


// ============================================================
// GÉNÉRATION DU MOT DE PASSE
// On construit d'abord le pool de caractères autorisés selon
// les options cochées, puis on tire des caractères au hasard.
// ============================================================
function generatePassword() {
  const length = parseInt(lengthSlider.value);

  // On construit le pool en ajoutant les jeux de caractères actifs
  let pool = "";
  if (optUpper.checked)   pool += CHARS.upper;
  if (optLower.checked)   pool += CHARS.lower;
  if (optNumbers.checked) pool += CHARS.numbers;
  if (optSymbols.checked) pool += CHARS.symbols;

  // Sécurité : au moins une option doit être cochée
  if (pool === "") {
    // Si rien n'est coché, on force "lower" pour éviter un mot de passe vide
    optLower.checked = true;
    pool = CHARS.lower;
  }

  // Génération : on tire "length" caractères aléatoires dans le pool
  let password = "";
  for (let i = 0; i < length; i++) {
    // Math.random() → nombre décimal entre 0 et 1
    // * pool.length  → entre 0 et la longueur du pool
    // Math.floor()   → arrondi vers le bas → indice entier valide
    const randomIndex = Math.floor(Math.random() * pool.length);
    password += pool[randomIndex];
  }

  return password;
}


// ============================================================
// FORCE DU MOT DE PASSE
// On calcule un score selon plusieurs critères :
//   - La longueur (plus c'est long, plus c'est fort)
//   - La variété des types de caractères utilisés
// ============================================================
function calculerForce(password) {
  let score = 0;

  // +1 point par tranche de longueur
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // +1 point par type de caractère présent dans le mot de passe
  // .test() retourne true si l'expression régulière trouve une correspondance
  if (/[A-Z]/.test(password)) score++;       // contient une majuscule
  if (/[a-z]/.test(password)) score++;       // contient une minuscule
  if (/[0-9]/.test(password)) score++;       // contient un chiffre
  if (/[^A-Za-z0-9]/.test(password)) score++; // contient un symbole

  // On convertit le score (0–7) en niveau de force
  if (score <= 2) return { niveau: "weak",   label: "Faible" };
  if (score <= 4) return { niveau: "fair",   label: "Moyen"  };
  if (score <= 5) return { niveau: "good",   label: "Bon"    };
  return           { niveau: "strong", label: "Fort"   };
}

// Met à jour visuellement la barre et le label de force
function afficherForce(password) {
  if (!password) {
    // Pas de mot de passe → on remet à zéro
    strengthFill.className  = "strength-fill";
    strengthLabel.className = "strength-label";
    strengthLabel.textContent = "—";
    return;
  }

  const { niveau, label } = calculerForce(password);

  // On applique la classe CSS correspondante (ex: "strength-fill strong")
  strengthFill.className  = `strength-fill ${niveau}`;
  strengthLabel.className = `strength-label ${niveau}`;
  strengthLabel.textContent = label;
}


// ============================================================
// AFFICHER LE MOT DE PASSE GÉNÉRÉ
// Regroupe : génération + affichage + calcul de force
// ============================================================
function afficherMotDePasse() {
  const password = generatePassword();
  passwordInput.value = password;
  afficherForce(password);

  // Animation "pulse" sur le bouton pour donner un feedback visuel
  btnGenerate.classList.remove("pulse");
  // On force le reflow pour que l'animation se rejoue même si déjà active
  void btnGenerate.offsetWidth;
  btnGenerate.classList.add("pulse");
}


// ============================================================
// COPIER DANS LE PRESSE-PAPIERS
// navigator.clipboard est l'API moderne pour copier du texte.
// Elle est asynchrone (Promise) donc on utilise .then() pour
// exécuter du code après la copie.
// ============================================================
function copierMotDePasse() {
  const password = passwordInput.value;

  // On ne fait rien si le champ est vide
  if (!password) return;

  // navigator.clipboard.writeText() retourne une Promise
  navigator.clipboard.writeText(password).then(() => {
    // Succès : on bascule l'icône copier → icône check (✓)
    iconCopy.style.display  = "none";
    iconCheck.style.display = "block";
    btnCopy.classList.add("copied");

    // On remet l'icône copier après 2 secondes
    setTimeout(() => {
      iconCopy.style.display  = "block";
      iconCheck.style.display = "none";
      btnCopy.classList.remove("copied");
    }, 2000);
  });
}


// ============================================================
// MISE À JOUR DE LA LONGUEUR
// Affiche la valeur du slider en temps réel pendant le glissement.
// ============================================================
function mettreAJourLongueur() {
  lengthValue.textContent = lengthSlider.value;
  // Si un mot de passe est déjà affiché, on le régénère avec la nouvelle longueur
  if (passwordInput.value) {
    afficherMotDePasse();
  }
}


// ============================================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// On branche chaque interaction à sa fonction correspondante.
// ============================================================

// Bouton "Générer"
btnGenerate.addEventListener("click", afficherMotDePasse);

// Bouton "Copier"
btnCopy.addEventListener("click", copierMotDePasse);

// Slider de longueur
lengthSlider.addEventListener("input", mettreAJourLongueur);

// Cases à cocher — on régénère automatiquement quand une option change
// (seulement si un mot de passe est déjà affiché)
[optUpper, optLower, optNumbers, optSymbols].forEach(opt => {
  opt.addEventListener("change", () => {
    if (passwordInput.value) {
      afficherMotDePasse();
    }
  });
});

// Raccourci clavier : Entrée → Générer | Ctrl+C → Copier
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") afficherMotDePasse();
  if ((e.ctrlKey || e.metaKey) && e.key === "c" && document.activeElement !== passwordInput) {
    copierMotDePasse();
  }
});


// ============================================================
// DÉMARRAGE
// On génère automatiquement un mot de passe au chargement
// pour que l'utilisateur voie directement le résultat.
// ============================================================
afficherMotDePasse();

// Année dynamique dans le footer
const elAnnee = document.getElementById("annee");
if (elAnnee) elAnnee.textContent = new Date().getFullYear();
