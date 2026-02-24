const User = require('../models/User');
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        let user;

        console.log('REQ BODY:', req.body);

        if (req.body.user && typeof req.body.user === 'string') {
            user = JSON.parse(req.body.user);
        } else if (req.body.user && typeof req.body.user === 'object') {
            user = req.body.user;
        } else if (req.query.id) {
            user = { id: req.query.id };
        } else {
            return res.status(401).json({ message: 'Not authorized, no user data' });
        }

        console.log('LOOKING FOR USER ID:', user?.id);

        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            try {
                token = req.headers.authorization.split(' ')[1];

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                req.user = await User.findOne({ id: decoded.id }).select('-password');

                if (!req.user) {
                    return res.status(401).json({ message: 'Not authorized, user not found' });
                }

                next();
            } catch (error) {
                console.error(error);
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { protect };