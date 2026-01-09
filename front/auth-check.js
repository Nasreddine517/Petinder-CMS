// auth-check.js - Gestion de l'authentification pour Petinder

// Fonction pour afficher un message
function showMessage(elementId, text, type) {
    const messageDiv = document.getElementById(elementId);
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Masquer après 5 secondes
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Fonction pour valider l'email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Fonction pour valider le mot de passe
function validatePassword(password) {
    return password.length >= 6;
}

// Fonction pour vérifier si l'utilisateur est déjà connecté
function checkIfLoggedIn(redirectUrl = 'accueilconnected.html') {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    
    return fetch('http://localhost:5000/api/auth/check', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (response.ok) {
            if (redirectUrl && !window.location.href.includes(redirectUrl)) {
                window.location.href = redirectUrl;
            }
            return true;
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_id');
            return false;
        }
    })
    .catch(() => {
        localStorage.removeItem('auth_token');
        return false;
    });
}

// Fonction de déconnexion
function logout() {
    fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST'
    }).catch(err => console.log('Erreur lors de la déconnexion:', err));
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');
    
    window.location.href = 'index.html';
}

// Fonction de connexion (pour seconnecter.html)
function handleLogin(event, emailId = 'email', passwordId = 'password', messageId = 'loginMessage') {
    event.preventDefault();
    
    const email = document.getElementById(emailId).value.trim();
    const password = document.getElementById(passwordId).value;
    
    if (!email || !password) {
        showMessage(messageId, 'Veuillez remplir tous les champs', 'error');
        return false;
    }
    
    if (!validateEmail(email)) {
        showMessage(messageId, 'Veuillez entrer une adresse email valide', 'error');
        return false;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Connexion en cours...';
    submitBtn.disabled = true;
    
    fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(messageId, 'Connexion réussie ! Redirection...', 'success');
            
            // Sauvegarder dans localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_email', data.user.email);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_id', data.user._id);
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                window.location.href = 'accueilconnected.html';
            }, 2000);
            
        } else {
            showMessage(messageId, data.message || 'Email ou mot de passe incorrect', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showMessage(messageId, 'Erreur de connexion au serveur', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
    
    return false;
}

// Fonction d'inscription (pour creercompta.html)
function handleRegister(event, nameId = 'fullName', emailId = 'registerEmail', passwordId = 'registerPassword', confirmId = 'confirmPassword', termsId = 'acceptTerms', messageId = 'registerMessage') {
    event.preventDefault();
    
    const name = document.getElementById(nameId).value.trim();
    const email = document.getElementById(emailId).value.trim();
    const password = document.getElementById(passwordId).value;
    const confirmPassword = document.getElementById(confirmId).value;
    const acceptTerms = document.getElementById(termsId).checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage(messageId, 'Veuillez remplir tous les champs', 'error');
        return false;
    }
    
    if (!validateEmail(email)) {
        showMessage(messageId, 'Veuillez entrer une adresse email valide', 'error');
        return false;
    }
    
    if (!validatePassword(password)) {
        showMessage(messageId, 'Le mot de passe doit contenir au moins 6 caractères', 'error');
        return false;
    }
    
    if (password !== confirmPassword) {
        showMessage(messageId, 'Les mots de passe ne correspondent pas', 'error');
        return false;
    }
    
    if (!acceptTerms) {
        showMessage(messageId, 'Veuillez accepter les conditions générales', 'error');
        return false;
    }
    
    // Désactiver le bouton
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Création en cours...';
    submitBtn.disabled = true;
    
    // Envoyer au backend
    fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            name: name,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Réponse backend:', data);
        
        if (data.success) {
            showMessage(messageId, 'Compte créé avec succès ! Connexion automatique...', 'success');
            
            // Sauvegarder dans localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_email', data.user.email);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_id', data.user._id);
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                window.location.href = 'accueilconnected.html';
            }, 2000);
            
        } else {
            showMessage(messageId, data.message || 'Erreur lors de la création du compte', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showMessage(messageId, 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
    
    return false;
}

// Fonction pour initialiser les formulaires sur la page
function initAuthForms() {
    // Formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            handleLogin(e);
        });
    }
    
    // Formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            handleRegister(e);
        });
    }
    
    // Bouton de déconnexion
    const logoutButtons = document.querySelectorAll('.logout-btn');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Initialiser quand le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initAuthForms();
        
        // Sur les pages de connexion/inscription, vérifier si déjà connecté
        if (window.location.pathname.includes('seconnecter.html') || 
            window.location.pathname.includes('creercompta.html')) {
            checkIfLoggedIn('accueilconnected.html');
        }
    });
} else {
    initAuthForms();
}

// Exporter les fonctions pour une utilisation globale
window.Auth = {
    showMessage,
    validateEmail,
    validatePassword,
    checkIfLoggedIn,
    logout,
    handleLogin,
    handleRegister,
    initAuthForms
};