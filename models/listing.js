const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews.js');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        filename: {
            type: String,
            default: 'listingimage'
        },
        url: {
            type: String,
            default: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg',
            set: (v) => v === '' ? 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg' : v
        }
    },
    price: Number,
    location: String,
    country: String,

    // ✅ Updated: categories is now an array of strings with enum validation
    categories: {
        type: [String],
        enum: [
            'trending',
            'mountains',
            'beach',
            'desert',
            'farms',
            'arctic',
            'countryside',
            'iconic-cities',
            'camping',
            'lake',
            'caves',
            'tropical'
        ],
        default: ['trending']
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});


// Owners array
const owners = [
  new mongoose.Types.ObjectId('6840594648ae9c6237ef9bd5'),
  new mongoose.Types.ObjectId('68416622498c6f503983c06e')
];

// Allowed categories (same enum as in schema)
const allCategories = [
  'trending',
  'mountains',
  'beach',
  'desert',
  'farms',
  'arctic',
  'countryside',
  'iconic cities',
  'camping',
  'lake',
  'caves',
  'tropical'
];

// Helper function: get random integer between min and max inclusive
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function: get random categories (1 to 3 unique categories)
function getRandomCategories() {
  const shuffled = allCategories.sort(() => 0.5 - Math.random());
  const count = randomInt(1, 3);
  return shuffled.slice(0, count);
}

// async function assignRandomCategoriesAndOwners() {
//   await mongoose.connect('mongodb://localhost:27017/wanderlust', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   const listings = await Listing.find({});
//   console.log(`Found ${listings.length} listings`);

//   for (const listing of listings) {
//     // Assign random categories
//     listing.categories = getRandomCategories();

//     // Assign random owner
//     listing.owner = owners[randomInt(0, owners.length - 1)];

//     await listing.save();
//     console.log(`Updated listing ${listing._id} with categories ${listing.categories} and owner ${listing.owner}`);
//   }

//   mongoose.connection.close();
//   console.log("Done updating listings.");
// }

// assignRandomCategoriesAndOwners().catch(console.error);

const Listing = mongoose.model('listing', listingSchema);

module.exports = Listing;
