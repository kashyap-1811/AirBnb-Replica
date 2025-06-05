const Listing = require('./models/listing.js');
const Review = require('./models/reviews.js');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged IN to perform this operation.");
        res.redirect('/login');
    }else{
        next();
    }
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) throw new ExpressError(404, "Listing not found!");

    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to edit/delete this Listing");
        return res.redirect(`/listings/${id}`);
    }
    
    next();
};

module.exports.isAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);

    if (!review) throw new ExpressError(404, "Review not found!");

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorized to edit/delete this review");
        return res.redirect(`/listings/${id}/reviews`);
    }
    
    next();
};