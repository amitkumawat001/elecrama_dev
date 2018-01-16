var mongoose = require('mongoose');

var Socials = new mongoose.Schema({
	Title: String, 
	Icon: String, 
	link: String
},
	{timestamps:true}
);

module.exports = mongoose.model('socials', Socials);