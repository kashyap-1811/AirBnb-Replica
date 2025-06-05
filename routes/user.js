const express = require('express');
const router = express.Router({mergeParams : true});

const {isLoggedIn} = require('../middleware.js');
const {saveRedirectUrl} = require('../middleware.js');

let userController = require('../controller/user.js');

//------------------------------------------------------------------------------------------------
//signup
router.get('/signup', userController.ShowSignupForm);

router.post('/signup', userController.signup);

//------------------------------------------------------------------------------------------------
//login
router.get('/login', userController.showLoginForm);

router.post('/login', saveRedirectUrl, userController.login);

//------------------------------------------------------------------------------------------------
//logout
router.get('/logout', isLoggedIn, userController.logout);

//------------------------------------------------------------------------------------------------
//export 
module.exports = router;

//------------------------------------------------------------------------------------------------