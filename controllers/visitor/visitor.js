var Visitor = require('../../models/visitor/visitor');

const VisitorController = {

	find: function(criteria, projection, options, callback){
    	Visitor.find(criteria, projection, options, callback);
	},
	findOne: function(params, callback){
		Visitor.findOne(params,function(err, visitor){
			if(err){
				callback(err,null)
				return;
			}
			callback(null, visitor)
		})
	},
	create: function(data, callback){
		console.log('original');
		console.log(data);
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
	},
	totalDocuments: function(query, callback){
		Visitor.count(query).exec(function(err, count) {
			if(err){
				callback(err, null)
				return
			}
			callback(null, count)
		});
	}
}
module.exports = VisitorController;