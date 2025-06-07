const express = require('express');
const router = express.Router({ mergeParams: true });

const multer = require('multer');
const {cloudinary, storage} = require('../cloudConfig.js');
const upload = multer({storage});

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
router.post('/', upload.single('Listing[image][url]'), ListingController.newListingPost);

//------------------------------------------------------------------------------------------------
//search
// Route: GET /listings/search?location=xyz
router.get('/search', ListingController.search);

//------------------------------------------------------------------------------------------------
// update route
router.get('/:id/edit', isLoggedIn, isOwner, ListingController.updateListingForm);

router.patch('/:id', isLoggedIn, isOwner, upload.single('image[url]'), ListingController.updateListing);

//------------------------------------------------------------------------------------------------
// delete route
router.delete('/:id', isLoggedIn, isOwner, ListingController.deleteListing);

//------------------------------------------------------------------------------------------------
// show route
router.get('/:id', ListingController.showListing);

//------------------------------------------------------------------------------------------------
//export
module.exports = router;