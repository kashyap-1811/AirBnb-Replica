const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const { listingSchema } = require('../schemas/schema.js');

//------------------------------------------------------------------------------------------------
//all listings page -> index
const validCategories = [
  'trending', 'mountains', 'beach', 'desert', 'farms',
  'arctic', 'countryside', 'iconic-cities', 'camping',
  'lake', 'caves', 'tropical'
];

module.exports.index = wrapAsync(async (req, res) => {
  const category = req.query.category;
  let filter = {};

  if (category && validCategories.includes(category)) {
    // Use $in for array matching categories
    filter.categories = category;
  }

  const allListings = await Listing.find(filter).populate('owner').populate('reviews');
  res.render('listings/index', { allListings, selectedCategory: category || '' });
});

//------------------------------------------------------------------------------------------------
//create listing
module.exports.newListingForm = (req, res) => {
    res.render('listings/new.ejs');
};

module.exports.newListingPost = wrapAsync(async (req, res, next) => {
    const { error } = listingSchema.validate(req.body.Listing); // Joi validation
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    }

    const { title, description, price, location, country } = req.body.Listing;

    // Normalize categories input: always treat it as an array
    let categories = req.body.categories || [];
    if (!Array.isArray(categories)) {
        categories = [categories]; // convert single value to array
    }

    // Optional: Ensure all category values are in lowercase to match your schema enum
    categories = categories.map(cat => cat.toLowerCase());

    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        categories, // ✅ enum-safe after lowercasing
        image: {
            filename: req.file?.filename || '',
            url: req.file?.path || '',
        },
        owner: req.user._id,
    });

    await newListing.save();
    req.flash("success", "New Listing created successfully!");
    res.redirect('/listings');
});

//------------------------------------------------------------------------------------------------
//show particular listing
module.exports.showListing = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({
                                                path: 'reviews',
                                                populate: { path: 'author' }
                                            }).populate('owner');

    if (!listing) throw new ExpressError(404, "Listing not found!");

    // console.log(listing);
    res.render('listings/show.ejs', { listing });
});

//------------------------------------------------------------------------------------------------
//update listing
module.exports.updateListingForm = wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    res.render('listings/edit.ejs', { listing });
});

module.exports.updateListing = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location, country, categories } = req.body;

    // Normalize categories (always an array, filter out empty values)
    let normalizedCategories = categories || [];
    if (!Array.isArray(normalizedCategories)) {
        normalizedCategories = [normalizedCategories];
    }
    normalizedCategories = normalizedCategories.filter(cat => cat && cat.trim() !== '');

    const updatedData = {
        title,
        description,
        price,
        location,
        country,
        categories: normalizedCategories,
    };

    // If a new image was uploaded
    if (req.file) {
        updatedData.image = {
            filename: req.file.filename,
            url: req.file.path,
        };
    }

    await Listing.findByIdAndUpdate(id, updatedData, { runValidators: true });
    req.flash("success", "Listing edited successfully!");
    res.redirect(`/listings/${id}`);
});

//------------------------------------------------------------------------------------------------
//delete Listing
module.exports.deleteListing = wrapAsync(async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", "listing Deleted Succesfully!");
    res.redirect('/listings');
});

//------------------------------------------------------------------------------------------------
module.exports.search = async (req, res) => {
  const { location } = req.query;

  // Handle empty input safely
  if (!location) {
    req.flash('error', 'Please enter a location.');
    return res.redirect('/listings');
  }

  // Case-insensitive search using RegExp
  const allListings = await Listing.find({
    location: { $regex: location, $options: 'i' }
  });

  if (allListings.length === 0) {
    req.flash('info', `No listings found for "${location}".`);
  }

  res.render('listings/index', { allListings, selectedCategory: '' });
};

//------------------------------------------------------------------------------------------------
