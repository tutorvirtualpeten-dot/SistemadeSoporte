const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
    let token;

    console.log('🔍 [optionalAuth] Headers:', req.headers.authorization ? 'Authorization header present' : 'No Authorization header');

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('🔑 [optionalAuth] Token extracted:', token ? token.substring(0, 20) + '...' : 'empty');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
            console.log('✅ [optionalAuth] Token verified, user ID:', decoded.id);
            req.user = await User.findById(decoded.id).select('-password');
            console.log('👤 [optionalAuth] User loaded:', req.user ? req.user.email : 'not found');
        } catch (error) {
            console.error('❌ [optionalAuth] Token verification failed:', error.message);
            // Si falla el token, seguimos como "guest"
        }
    } else {
        console.log('⚠️ [optionalAuth] No Bearer token found in headers');
    }
    next();
};

module.exports = { optionalAuth };
