// server.js - Backend nasser_database avec MongoDB Atlas Cloud (FIXED)

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ==================== CONNEXION MONGODB ATLAS ====================

// Récupérer l'URI MongoDB depuis .env
const MONGODB_URI = "mongodb+srv://nasser_database:itawV_bBf5!!efS@cluster0.liba9f4.mongodb.net/nasser_database?retryWrites=true&w=majority"; //process.env.MONGODB_URI || 'mongodb://localhost:27017/nasser_database';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_nasser_database_12345';

console.log('\n🔌 Tentative de connexion à MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/password:[^@]*/, 'password:****'));

// Connexion à MongoDB Atlas - FIXED VERSION (Mongoose 9.x)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connecté avec succès !');
    console.log('🗄️  Base de données: nasser_database');
  })
  .catch((error) => {
    console.error('❌ Erreur connexion MongoDB Atlas:', error.message);
    console.error('📌 Vérifiez:');
    console.error('   1. Votre IP est dans "Network Access" sur MongoDB Atlas');
    console.error('   2. Les credentials dans .env sont corrects');
    console.error('   3. La connection string a /nasser_database dans le chemin');
    process.exit(1);
  });

// ==================== SCHÉMA ET MODÈLE UTILISATEUR ====================

// Définir le schéma utilisateur
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Créer le modèle User
const User = mongoose.model('User', UserSchema);

// ==================== MIDDLEWARE ====================

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token');
  res.header('Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    console.log('🔄 Pré-requête CORS OPTIONS reçue');
    return res.status(200).json({
      message: 'CORS preflight successful'
    });
  }
  next();
});

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== ROUTES ====================

// 1. Route de test
app.get('/api/test', (req, res) => {
  console.log('✅ Test API appelé depuis:', req.headers.origin || 'origine inconnue');
  res.json({
    success: true,
    message: '🚀 Backend nasser_database avec MongoDB Atlas fonctionne !',
    timestamp: new Date(),
    version: '2.2.0',
    database: 'MongoDB Atlas (Cloud)',
    cors: 'Enabled',
    endpoints: [
      '/api/test',
      '/api/health',
      '/api/echo',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/check',
      '/api/auth/logout',
      '/api/users'
    ]
  });
});

// 2. Route de santé avec info MongoDB
app.get('/api/health', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const dbConnection = mongoose.connection.readyState;
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'MongoDB Atlas Connected',
      dbReadyState: dbConnection === 1 ? 'Connected' : 'Disconnected',
      usersCount: usersCount
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 3. Route echo pour debug
app.post('/api/echo', (req, res) => {
  console.log('📨 Echo reçu:', req.body);
  console.log('📋 Headers:', req.headers);
  res.json({
    success: true,
    message: 'Echo successful',
    received: req.body,
    timestamp: new Date()
  });
});

// 4. Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion depuis:', req.headers.origin || 'origine inconnue');
    console.log('📧 Email reçu:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Chercher l'utilisateur dans MongoDB Atlas
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.log('⚠️ Erreur bcrypt:', bcryptError.message);
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Connexion réussie pour:', user.email);
    console.log('🔑 Token généré');

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 5. Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Inscription reçue depuis:', req.headers.origin || 'origine inconnue');
    console.log('📋 Données reçues:', {
      email: req.body.email,
      name: req.body.name,
      hasPassword: !!req.body.password
    });

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log('❌ Champs manquants');
      return res.status(400).json({
        success: false,
        message: 'Email, nom et mot de passe sont requis'
      });
    }

    // Validation email simple
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Format email invalide:', email);
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Vérifier si l'email existe déjà dans MongoDB Atlas
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit avoir au moins 6 caractères'
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur dans MongoDB Atlas
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim()
    });

    // Sauvegarder dans MongoDB Atlas
    await newUser.save();

    // Générer le token
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Nouvel utilisateur créé:', newUser.email, 'ID:', newUser._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 6. Vérifier l'authentification
app.get('/api/auth/check', (req, res) => {
  try {
    console.log('🔍 Vérification auth depuis:', req.headers.origin || 'origine inconnue');
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token manquant dans headers');
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou mal formaté'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ Token vide');
      return res.status(401).json({
        success: false,
        message: 'Token vide'
      });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔑 Token décodé:', decoded);

    res.json({
      success: true,
      user: {
        _id: decoded.userId,
        name: decoded.name,
        email: decoded.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur vérification token:', error.message);
    let errorMessage = 'Token invalide';

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expiré, veuillez vous reconnecter';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformé';
    }

    res.status(401).json({
      success: false,
      message: errorMessage
    });
  }
});

// 7. Déconnexion
app.post('/api/auth/logout', (req, res) => {
  console.log('👋 Déconnexion depuis:', req.headers.origin || 'origine inconnue');
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// 8. Route pour lister tous les utilisateurs (pour debug)
app.get('/api/users', async (req, res) => {
  try {
    console.log('👥 Liste utilisateurs demandée depuis:', req.headers.origin || 'origine inconnue');

    // Récupérer tous les utilisateurs de MongoDB Atlas sans les mots de passe
    const users = await User.find({}, { password: 0 }).lean();

    res.json({
      success: true,
      count: users.length,
      users: users,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 9. Route pour créer un utilisateur test rapidement
app.post('/api/create-test-user', async (req, res) => {
  try {
    const testEmail = `test${Date.now()}@test.com`;
    const hashedPassword = await bcrypt.hash('123456', 10);

    const testUser = new User({
      email: testEmail,
      password: hashedPassword,
      name: `Test User ${Date.now()}`
    });

    await testUser.save();

    console.log('🧪 Utilisateur test créé:', testEmail);

    res.json({
      success: true,
      message: 'Utilisateur test créé',
      user: {
        _id: testUser._id,
        email: testUser.email,
        password: '123456', // Pour le test
        name: testUser.name
      }
    });

  } catch (error) {
    console.error('❌ Erreur création utilisateur test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== ROUTES 404 ====================

app.use('/api/:any', (req, res) => {
  console.log('❌ Route API non trouvée:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route API non trouvée: ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/test',
      'GET /api/health',
      'POST /api/echo',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/check',
      'POST /api/auth/logout',
      'GET /api/users',
      'POST /api/create-test-user'
    ],
    timestamp: new Date()
  });
});

app.use((req, res) => {
  console.log('❌ Route non trouvée:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
    tip: 'Utilisez les routes API préfixées par /api/',
    timestamp: new Date()
  });
});

// ==================== GESTION DES ERREURS GLOBALES ====================

app.use((err, req, res, next) => {
  console.error('🔥 Erreur non gérée:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== DÉMARRAGE DU SERVEUR ====================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`

╔══════════════════════════════════════════════════════╗
║ 🚀 BACKEND nasser_database AVEC MONGODB ATLAS DÉMARRÉ ! ║
╠══════════════════════════════════════════════════════╣
║ 📍 Port: ${PORT}
║ 🌐 URL: http://localhost:${PORT}
║ 🔓 CORS: Activé (toutes origines autorisées)
║ 🗄️  Base de données: MongoDB Atlas (Cloud)
║ ☁️  Mongoose: Version ${mongoose.version}
╠══════════════════════════════════════════════════════╣
║ 📡 ROUTES DISPONIBLES:
║ GET /api/test → Test du serveur
║ GET /api/health → Santé du serveur
║ POST /api/echo → Echo pour debug
║ POST /api/auth/login → Connexion
║ POST /api/auth/register → Inscription
║ GET /api/auth/check → Vérif. authentification
║ POST /api/auth/logout → Déconnexion
║ GET /api/users → Liste users (debug)
║ POST /api/create-test-user → Créer user test
╠══════════════════════════════════════════════════════╣
║ 🎯 TESTER RAPIDEMENT:
║ $ curl http://localhost:${PORT}/api/test
║ $ curl http://localhost:${PORT}/api/health
╚══════════════════════════════════════════════════════╝

`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;