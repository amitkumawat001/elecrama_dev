var models = require('../../models');
var Stall = models.stall;


const StallController = {

	find: function(criteria, projection, options, callback){
    	Stall.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new Stall(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	Stall.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Stall.find(criteria).select(projection).exec(function(err, Stall){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Stall)
    	})
	},
	distinctRecords: function(criteria, fieldname, callback){
		Stall.find(criteria).distinct(fieldname).exec(callback);
	},
	totalRecords: function(offset, callback){
		Stall.count().exec(function(err, count) {
			if(err){
				callback(err, null)
				return
			}
			callback(null, count)
		});
	}
}
module.exports =StallController;