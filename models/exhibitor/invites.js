var mongoose =  require('mongoose');

var invites = new mongoose.Schema({
	exhibitor : {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Exhibitor'
	},
	mobile_numbers:[{type:String}],
	emails:[{type:String}],
	Hall_no : String,
	Stall_no : String,
	message : String
},
	{timestamps:true}
);

module.exports = mongoose.model('invites', invites);