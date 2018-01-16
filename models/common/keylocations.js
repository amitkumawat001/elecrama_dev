var mongoose = require('mongoose');

var KeyLocations = new mongoose.Schema({
	Title : String,
	Contact_PersonName : String,
	Contact_PersonMobile : String,
	Address : String,
	Type: {type:String, default:""},
	Lat : String,
	Lng : String
},
	{timestamps:true}
);

module.exports = mongoose.model('KeyLocations', KeyLocations);