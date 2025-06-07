//------------------------------------------------------------------------------------------------
//imports
if(process.env.NODE_ENV != 'PRODUCTION')
    require('dotenv').config();

const express = require('express');
const app = express();

app.listen(8080, () => {
    console.log(`app listening on port 8080`);
});

//------------------------------------------------------------------------------------------------
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const flash = require('connect-flash');
// const wrapAsync = require('./utils/wrapAsync.js');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");

//------------------------------------------------------------------------------------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // fixed use of path.join
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

//------------------------------------------------------------------------------------------------
const cloudDB = `mongodb+srv://kashyaprupareliya1811:${process.env.password}@cluster0.cq5doyt.mongodb.net/wanderlust-atlas?retryWrites=true&w=majority&appName=Cluster0`;

async function main() {
    await mongoose.connect(cloudDB)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));
}

main();

//------------------------------------------------------------------------------------------------
//Sessions
const session = require('express-session');
const MongoStore = require('connect-mongo');

const store = MongoStore.create({
    mongoUrl: cloudDB,
    crypto: {
        secret: process.env.secret,
    },
    touchAfter: 24 * 3600,
});

store.on("error" , (err) => {
    console.log("ERROR IN MONGO STORE.", err)
});

const sessionOption = {
    store: store,
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
};

app.use(session(sessionOption));
app.use(flash());

//------------------------------------------------------------------------------------------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//------------------------------------------------------------------------------------------------
//flash middleware
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.loggedIN = req.isAuthenticated();
    res.locals.user = req.user;
    next();
});

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
// root
app.get('/', (req, res) => {
    res.render("home.ejs");
});

//------------------------------------------------------------------------------------------------
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/reviews.js');
const UserRoutes= require('./routes/user.js');

//------------------------------------------------------------------------------------------------
//listings routes
app.use('/listings', listingRoutes);

//------------------------------------------------------------------------------------------------
//Reviews routes
app.use('/listings/:id/reviews', reviewRoutes);

//------------------------------------------------------------------------------------------------
//User routes
app.use('/', UserRoutes);

//------------------------------------------------------------------------------------------------
// common error
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found!'));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;

    if (status == 500)
        err.message - "Something Went Wrong";
    res.status(status).render("error", { err });
});

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------