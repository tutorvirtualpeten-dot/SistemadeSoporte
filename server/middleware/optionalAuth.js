const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            console.error(error);
            // Si falla el token, seguimos como "guest"
        }
    }
    next();
};

module.exports = { optionalAuth };
