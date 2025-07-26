// 📁 models/User.js
const mongoose = require('mongoose'); // ✅ This is REQUIRED

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model('User', userSchema); // ✅ This returns a model with findOne()
