const User = require('../models/User');
const protect = async (req, res, next) => {
    try {
        let user;
        // 1. Handle "user" as string (Legacy Frontend quirk)
        if (req.body.user && typeof req.body.user === 'string') {
            user = JSON.parse(req.body.user);
        } else if (req.body.user && typeof req.body.user === 'object') {
            user = req.body.user;
        } else if (req.query.id) {
            // Sometimes we pass ID in query
            user = { id: req.query.id };
        } else {
            // For now, if no user is provided, we might fail or allow (depending on route)
            // But let's assume we need to find the user in DB to be safe
            return res.status(401).json({ message: 'Not authorized, no user data' });
        }
        // 2. Verify against DB
        const dbUser = await User.findOne({ id: user.id });
        if (!dbUser) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }
        // 3. Attach full user object to Request
        req.user = dbUser;
        next(); // Pass to next link in chain
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
module.exports = { protect };
