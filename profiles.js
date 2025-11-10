// --- Script de filtrage des profils ---
const chips = document.querySelectorAll('.chip');
const cartes = document.querySelectorAll('.carte-profil');

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        // retire la classe active de tous les boutons
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filtre = chip.dataset.filter;

        cartes.forEach(card => {
            const type = card.dataset.type;
            const sexe = card.dataset.sex;

            if (filtre === 'all' || filtre === type || filtre === sexe) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});




