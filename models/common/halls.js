var mongoose = require('mongoose');
var Hall = new mongoose.Schema({
	Hall_title : String,
	Hall_director : {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'},
	Hall_managers :[{type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'}]
	},
    {timestamps:true}
);

module.exports = mongoose.model('Halls', Hall);