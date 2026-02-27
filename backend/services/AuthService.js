const User = require('../models/User');
const SubRole = require('../models/SubRole');
const UserFactory = require('../factories/UserFactory');
const jwt = require('jsonwebtoken');

class AuthService {
    static async register(userData) {
        const { username, id, password, role, subRole, batch } = userData;

        const existingUserById = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
        if (existingUserById) {
            const error = new Error('User ID already exists');
            error.statusCode = 400;
            throw error;
        }

        let subRoleObjId = null;
        if (subRole) {
            const subRoleDoc = await SubRole.findOne({
                $or: [
                    { displayName: { $regex: new RegExp("^" + subRole + "$", "i") } },
                    { name: { $regex: new RegExp("^" + subRole + "$", "i") } },
                    { code: { $regex: new RegExp("^" + subRole + "$", "i") } }
                ]
            });

            if (subRoleDoc) {
                subRoleObjId = subRoleDoc._id;
            } else if (role === 'Faculty' || role === 'Student') {
                const error = new Error('Invalid subRole: ' + subRole);
                error.statusCode = 400;
                throw error;
            }
        }

        if ((role === 'Faculty' || role === 'Student') && !subRoleObjId) {
            const error = new Error('subRole (department) is required and must be valid');
            error.statusCode = 400;
            throw error;
        }

        if (role !== 'Faculty' && role !== 'Admin' && role !== 'Student') {
            const existingUserByRoleAndSubRole = await User.findOne({ role, subRole: subRoleObjId });
            if (existingUserByRoleAndSubRole) {
                const error = new Error('User with this role and subRole already exists');
                error.statusCode = 400;
                throw error;
            }
        }

        const newUser = UserFactory.create({
            username,
            id,
            password,
            role,
            subRole: subRoleObjId,
            batch,
        });

        await newUser.save();
        return newUser;
    }

    static async login(id, password) {
        const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } }).populate('subRole');

        if (user && user.password === password) {
            const userObj = user.toObject();
            if (userObj.subRole && typeof userObj.subRole === 'object') {
                userObj.subRoleId = userObj.subRole._id;
                userObj.subRole = userObj.subRole.displayName || userObj.subRole.code;
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            return { user: userObj, token };
        } else {
            const error = new Error('Invalid credentials!');
            error.statusCode = 401;
            throw error;
        }
    }

    static async updateUsername(id, newUsername) {
        const user = await User.findOne({ id: { $regex: new RegExp("^" + id + "$", "i") } });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        user.username = newUsername;
        await user.save();
        return user;
    }
}

module.exports = AuthService;
