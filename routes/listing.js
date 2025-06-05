const express = require('express');
const router = express.Router({ mergeParams: true });

//------------------------------------------------------------------------------------------------
const { isLoggedIn, isOwner } = require('../middleware.js');
const ListingController = require('../controller/listing.js');

//------------------------------------------------------------------------------------------------
// index route
router.get('/', ListingController.index);

//------------------------------------------------------------------------------------------------
// new route
router.get('/new', isLoggedIn, ListingController.newListingForm);

// create route
router.post('/', ListingController.newListingPost);

//------------------------------------------------------------------------------------------------
// show route
router.get('/:id', ListingController.showListing);

//------------------------------------------------------------------------------------------------
// update route
router.get('/:id/edit', isLoggedIn, isOwner, ListingController.updateListingForm);

router.patch('/:id', isLoggedIn, isOwner, ListingController.updateListing);

//------------------------------------------------------------------------------------------------
// delete route
router.delete('/:id', isLoggedIn, isOwner, ListingController.deleteListing);

//------------------------------------------------------------------------------------------------
//export
module.exports = router;

//------------------------------------------------------------------------------------------------
