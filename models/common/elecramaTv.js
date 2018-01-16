var mongoose = require('mongoose');

var ElecaramaTv = new mongoose.Schema({
	Title : String,
	Description : String,
	Showcase_date : String,
	Showcase_time : {
		start_time:String,
		end_time :String,
	},
	Youtube_video_id : String,
	Thumbnail_url : String
},
	{timestamps:true}
);

module.exports = mongoose.model('ElecaramaTv', ElecaramaTv);