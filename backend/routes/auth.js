const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupRules, loginRules, updateProfileRules } = require('../validators/auth');

router.post('/signup',  authController.signup);
router.post('/login',  authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);
router.patch('/profile', auth, validate(updateProfileRules), authController.updateProfile);

module.exports = router;
