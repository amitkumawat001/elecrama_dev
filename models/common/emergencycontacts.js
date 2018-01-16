var mongoose = require('mongoose');

var EmergencyContacts = new mongoose.Schema({
	Title : String,
	Contact_number : String,
},
	{timestamps:true}
);

module.exports = mongoose.model('EmergencyContacts', EmergencyContacts);