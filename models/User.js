const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName:String,
    age:String,
    email: String,
    kind:String,
    password:String
});
module.exports = mongoose.model("User", UserSchema);