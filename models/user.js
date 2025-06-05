const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passsportLocalmongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});
//username and passeord will automatically provided by passport-local-mongoose

userSchema.plugin(passsportLocalmongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;