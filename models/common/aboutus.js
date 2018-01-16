var mongoose = require('mongoose');

var About = new mongoose.Schema({
	Banner_image: String, 
	Title: String, 
	Description: String
},
	{timestamps:true}
);

module.exports = mongoose.model('about', About);