var mongoose = require('mongoose');
var Visitor_tracker = new mongoose.Schema({
	visitor_id: String,
	lat:String,
	lng:String,
	altitude:String,
	distance:String,
},
	{timestamps:true}
);

module.exports = mongoose.model('Visitor_tracker', Visitor_tracker);