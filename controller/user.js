const wrapAsync = require('../utils/wrapAsync');
const User = require("../models/user.js");

//------------------------------------------------------------------------------------------------
//signup
module.exports.ShowSignupForm = (req, res) => {
    res.render("users/signup.ejs", { errors: {}, user: {} });
};

module.exports.signup = wrapAsync(async (req, res) => {
    const { username, email, password } = req.body.user;

    try {
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        // On success, redirect or render wherever you want
        req.flash("success", `you have registered please login to enter.`);
        res.redirect('/login');
    } catch (err) {
        // Send back username and error message to render below the username field
        res.status(400).render('users/signup.ejs', { 
            user: { username, email }, 
            errors: { username: `Username "${username}" already exists` } 
        });
    }
});

//------------------------------------------------------------------------------------------------
//login
module.exports.showLoginForm = (req, res) => {
  res.render('users/login', { errors: {}, user: {} });
};

module.exports.login = async (req, res, next) => {
    const { username, password } = req.body.user;

    try {
        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).render('users/login.ejs', {
                user: { username },
                errors: { username: `Username "${username}" not found` }
            });
        }

        // Authenticate using passport-local strategy (manual check)
        const isValid = await user.authenticate(password);
        if (!isValid.user) {
            return res.status(400).render('users/login.ejs', {
                user: { username },
                errors: { password: 'Incorrect password' }
            });
        }

        // If valid, login the user manually
        req.login(user, (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome back, ${username}`);

            // console.log(req.user);

            const redirectUrl = res.locals.redirectUrl || '/';
            res.redirect(redirectUrl);
        });
    } catch (err) {
        next(err);
    }
};

//------------------------------------------------------------------------------------------------
//logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err)
            next(err);
        req.flash("success", "successfully logout!");
        res.redirect('/');
    });
};

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------