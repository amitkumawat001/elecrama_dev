var StallVisited = require('../../models/visitor/stallvisited');


const StallVisitedController = {

	find: function(criteria, projection, options, callback){
    	StallVisited.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new StallVisited(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	StallVisited.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(id, callback){
		
	},
	findWithSelect: function(criteria, projection, options, callback){
    	StallVisited.find(criteria).select(projection).exec(function(err, locate){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, locate)
    	})
	},
	findOne: function(criteria, projection, options, callback){
		StallVisited.find(criteria).limit(1).exec(callback);
	}
}
module.exports =StallVisitedController;