var mongoose = require('mongoose');

var Contacts = new mongoose.Schema({
	User_id : {type:String},
	User_type : {type:String},
	Scaned_USER: {
		kind: String,
    	item: { type:  mongoose.Schema.Types.ObjectId, refPath: 'Scaned_USER.kind' }
	},
	Scaned_userType : String,
	Scaned_Exhibitor : {type: mongoose.Schema.Types.ObjectId, ref:'Exhibitor'},
	Scaned_Visitor: {type: mongoose.Schema.Types.ObjectId, ref:'Visitor'},
	Friend : {
		id : {type:String, default:''},
		name : {type:String, default:''},
		email : {type:String, default:''},
		mobile : {type:String, default:''},
		profile_pic : {type:String, default:''}
	}
},
	{timestamps:true}
);

module.exports = mongoose.model('UserContacts', Contacts);