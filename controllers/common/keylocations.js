var KeyLocations = require('../../models/common/keylocations');


const KeylocationsControllers = {

	find: function(criteria, projection, options, callback){
    	KeyLocations.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new KeyLocations(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	KeyLocations.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	KeyLocations.find(criteria).select(projection).exec(function(err, Keylocations){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Keylocations)
    	})
	}
}
module.exports =KeylocationsControllers;