const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const Review = require('../models/reviews.js');
const { reviewJoiSchema } = require('../schemas/review.js');

//------------------------------------------------------------------------------------------------
//show all reviews
module.exports.showAllReviews = async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 10;
    const skip = (page - 1) * limit;

    // Find listing and populate owner
    const listing = await Listing.findById(id).populate('owner');

    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    // Count total reviews
    const totalReviews = await Review.countDocuments({ _id: { $in: listing.reviews } });
    const totalPages = Math.ceil(totalReviews / limit);

    // Paginate and populate reviews
    const paginatedReviews = await Review.find({ _id: { $in: listing.reviews } })
        .populate('author')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

    // Replace the listing's reviews temporarily with paginated ones
    listing.reviews = paginatedReviews;

    res.render('reviews/all', {
        listing,
        currentPage: page,
        totalPages,
        limit
    });
};

//------------------------------------------------------------------------------------------------
//create new reviews
module.exports.addNewReview = wrapAsync(async (req, res, next) => {
    const { id } = req.params;

    // Validate request body with Joi
    const { error } = reviewJoiSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(400, "Listing not found");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;

    await review.save();
    listing.reviews.push(review);
    await listing.save();

    req.flash("success", "New Review created successfully!");
    res.redirect(`/listings/${id}`);
});

//------------------------------------------------------------------------------------------------
//Edit Review
module.exports.showEditForm = wrapAsync(async (req, res) => {
    let {reviewId} = req.params;
    const review = await Review.findById(reviewId);

    res.render('reviews/edit.ejs', { review, listingId: id });
});

module.exports.editReview = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const { comment, rating } = req.body.review;
    await Review.findByIdAndUpdate(reviewId, { comment, rating });

    req.flash("success", "Review updated successfully!");
    res.redirect(`/listings/${id}/reviews`);
});

//------------------------------------------------------------------------------------------------
//Delete Review
module.exports.deleteReview = wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Delete the review document itself
    await Review.findByIdAndDelete(reviewId);

    // Redirect back to the listing details page after deletion
    req.flash("success", "Review Deleted successfully!");
    res.redirect(`/listings/${id}/reviews`);
});

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------