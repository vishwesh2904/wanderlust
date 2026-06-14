const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn } = require('../middleware.js');

const userController = require('../controllers/user.js');

router.post('/signup', wrapAsync(userController.signup));

router.post('/login', wrapAsync(userController.login));

router.post('/upgrade', isLoggedIn, wrapAsync(userController.upgradeToHost));

router.get('/logout', userController.logout);

router.get('/me', wrapAsync(userController.getMe));

module.exports = router;
