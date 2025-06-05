const express = require('express');
const router = express.Router({mergeParams : true});

//------------------------------------------------------------------------------------------------
const { isLoggedIn, isAuthor } = require('../middleware.js');
const reviewController = require("../controller/review.js");

//------------------------------------------------------------------------------------------------
// Show all reviews for a particular listing with pagination
router.get('/', reviewController.showAllReviews);

//------------------------------------------------------------------------------------------------
//add new Review
router.post('/', isLoggedIn, reviewController.addNewReview);

//------------------------------------------------------------------------------------------------
// Edit Form
// Show edit form for a review of a specific listing
router.get('/:reviewId/edit', isLoggedIn, isAuthor, reviewController.showEditForm);

// Update a review of a specific listing
router.put('/:reviewId', isLoggedIn, isAuthor, reviewController.editReview);

//------------------------------------------------------------------------------------------------
// Delete Review
// Middleware to remove review reference from listing's reviews array
const removeReviewFromListing = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        // Remove the reviewId from the listing's reviews array
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        next();
    } catch (err) {
        next(err); // Pass error to error handler middleware
    }
};

const deleteLoggedInCheck = (req, res, next) => {
    let {id} = req.params;
    if(!req.isAuthenticated()){
        req.session.redirectUrl = `/listings/${id}/reviews`;
        req.flash("error", "you must be logged IN to perform this operation.");
        res.redirect('/login');
    }else{
        next();
    }
};

// Delete review route with middleware to clean up listing's reviews array
router.delete('/:reviewId', deleteLoggedInCheck, isAuthor, removeReviewFromListing, reviewController.deleteReview);

//------------------------------------------------------------------------------------------------
//export
module.exports = router;

//------------------------------------------------------------------------------------------------
