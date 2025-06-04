// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  spotify_id: String,
  display_name: String,
  email: String,
  access_token: String,
  refresh_token: String,
  expires_in: Number,
  scope: String,
  product: String,
  country: String,
  profile_url: String,
  followers: Number,
});

module.exports = mongoose.model('User', UserSchema);
