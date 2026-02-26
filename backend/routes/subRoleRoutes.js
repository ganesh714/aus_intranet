const express = require('express');
const router = express.Router();
const subRoleController = require('../controllers/subRoleController');

router.get('/all-subroles', subRoleController.getAllSubRoles);
router.get('/subroles/:role', subRoleController.getSubRolesByRole);

router.get('/subroles/details/:id', subRoleController.getSubroledetails);

router.post('/add-subrole', subRoleController.createSubRole);
router.delete('/delete-subrole/:id', subRoleController.deleteSubRole);

module.exports = router;
