var mongoose = require('mongoose');
var StallVisited = new mongoose.Schema({
	Stall : String,
	Visitor_id : {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'}
	},
    {timestamps:true}
);

module.exports = mongoose.model('stallvisited', StallVisited);