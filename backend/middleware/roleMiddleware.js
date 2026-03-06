const SubRole = require('../models/SubRole');

// Allow specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Require a specific special feature on the user's SubRole
const requireSubRoleFeature = (featureName) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.subRole) {
                return res.status(403).json({ message: 'No SubRole assigned.' });
            }

            // Fetch the user's SubRole from the database
            const userSubRole = await SubRole.findById(req.user.subRole);

            // Check if this subrole has the required special feature
            if (!userSubRole || !userSubRole.specialFeatures.includes(featureName)) {
                return res.status(403).json({
                    message: `Access Denied: Your department does not have the '${featureName}' feature.`
                });
            }

            next();
        } catch (error) {
            console.error("Middleware Error:", error);
            res.status(500).json({ message: 'Server error verifying permissions' });
        }
    };
};

module.exports = { authorize, requireSubRoleFeature };
