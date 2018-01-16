var mongoose = require('mongoose');

var UserNotification =  new mongoose.Schema({
	From_userId:{type:mongoose.Schema.Types.ObjectId},
	To_userId:{type:mongoose.Schema.Types.ObjectId},
	Message:String,
	Message1:String,
	Type:String
},
	{timestamps:true}
);

module.exports = mongoose.model('usernotifications', UserNotification);