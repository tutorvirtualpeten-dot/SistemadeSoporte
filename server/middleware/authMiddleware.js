const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Obtener token del header
            token = req.headers.authorization.split(' ')[1];

            // Verificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro');

            // Obtener usuario del token (sin password)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && (req.user.rol === 'admin' || req.user.rol === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado como administrador' });
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.rol === 'super_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Requiere nivel Super Administrador' });
    }
};

const agentOrAdmin = (req, res, next) => {
    if (req.user && (req.user.rol === 'agente' || req.user.rol === 'admin' || req.user.rol === 'super_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'No autorizado como staff' });
    }
};

module.exports = { protect, adminOnly, superAdminOnly, agentOrAdmin };
