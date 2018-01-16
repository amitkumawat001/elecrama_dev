var mongoose = require('mongoose');
var VisitorFavList = new mongoose.Schema({
	Visitor_id : {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'},
	Fav_Exhibitors : [{type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor'}]
},
	{timestamps:true}
);

module.exports = mongoose.model('VisitorFavLsit', VisitorFavList);