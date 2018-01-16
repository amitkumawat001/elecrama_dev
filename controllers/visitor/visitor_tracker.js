var Visitor = require('../../models/visitor/visitor_tracker');

const VisitorTrackerController = {

	find: function(params, callback){
    	Visitor.find(params).sort({'_id':-1}).limit(1).exec(function(err, Visitor){
			if(err){
				callback(err, null);
				return;
			}
			callback(null, Visitor);
		});
	},
	findOne: function(params, callback){
		Visitor.findOne(params,function(err, visitor){
			if(err){
				callback(err,null)
				return
			}
			callback(null, visitor)
		})
	},
	create: function(data, callback){
    	new Visitor(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	Visitor.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Visitor.find(criteria).select(projection).exec(function(err, Visitor){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Visitor)
    	})
	}
	/*findwithSort: function(params, callback){
		Visitor.find(params).sort({'_id':-1}).limit(1).exec(function(err, Visitor){
			if(err){
				callback(err, null);
				return;
			}
			callback(null, Visitor);
		});
	}*/
}
module.exports = VisitorTrackerController;