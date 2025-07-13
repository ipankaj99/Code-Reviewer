const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/User-Login')
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.error('MongoDB connection error:', err));

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // was 'require', should be 'required'
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePhoto: {
    type:String,
   
  }
});

const userLogin = mongoose.model('userLogin', schema); // <- fix here too
module.exports = userLogin;
