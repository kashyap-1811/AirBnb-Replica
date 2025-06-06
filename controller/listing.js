const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const { listingSchema } = require('../schemas/schema.js');

//------------------------------------------------------------------------------------------------
//all listings page -> index
module.exports.index = wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
});

//------------------------------------------------------------------------------------------------
//create listing
module.exports.newListingForm = (req, res) => {
    res.render('listings/new.ejs');
};

module.exports.newListingPost = wrapAsync(async (req, res, next) => {
    const { error } = listingSchema.validate(req.body.Listing);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    }

    const { title, description, price, location, country } = req.body.Listing;

    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: {
            filename: req.file.filename,
            url: req.file.path || undefined,
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
    let {id} = req.params;
    const { title, description, price, location, country, image } = req.body;

    const updatedData = {
        title,
        description,
        price,
        location,
        country,
    };

    if(req.file){
        updatedData.image = {
            filename: req.file.filename,
            url: req.file.path,
        }
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


//------------------------------------------------------------------------------------------------
