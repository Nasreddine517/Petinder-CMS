// --- Script de filtrage des profils ---
const chips = document.querySelectorAll('.chip');
const cartes = document.querySelectorAll('.carte-profil');
const voirBtns = document.querySelectorAll('.voir-btn'); // Tous les boutons "Voir le profil"

// Fonction de filtrage des profils
function filterProfiles(filtre) {
    cartes.forEach(card => {
        const type = card.dataset.type;
        const sexe = card.dataset.sex;
        if (filtre === 'all' || filtre === type || filtre === sexe) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Fonction d'alerte pour la connexion (simplifiée)
function showAlert() {
    alert("⚠️ Connecte-toi ou crée un compte pour continuer.");
    // Redirige vers la page de connexion après l'alerte
    window.location.href = "seconecter.html"; 
}

// Gestion du clic sur les filtres
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filtre = chip.dataset.filter;
        filterProfiles(filtre);
    });
});

// Ajouter un événement de clic sur chaque bouton "Voir le profil"
voirBtns.forEach(btn => {
    btn.addEventListener('click', (event) => {
        event.preventDefault(); // Empêche la navigation vers la page du profil
        showAlert(); // Affiche l'alerte
    });
});
