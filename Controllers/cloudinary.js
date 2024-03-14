const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dzbg9iuo2',
  api_key: '466774115781539',
  api_secret: 'kWAxHuQ3Tls5rEkKDbTVPwA1Wts'
});



  module.exports= cloudinary;


// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// module.exports = cloudinary;