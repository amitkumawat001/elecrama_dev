var Exhibitor = require('../../models/exhibitor/exhibitor');

const ExhibitorController = {

	find: function(criteria, projection, options, callback){
    	Exhibitor.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
		//console.log(data);
    	new Exhibitor(data).save(callback);
	},
	findOne: function(params, callback){
		Exhibitor.findOne(params,function(err, exhibitor){
			if(err){
				callback(err,null)
				return
			}
			callback(null, exhibitor)
		})
	},
	saveAll: function(data, callback){
    	Exhibitor.insertMany(data).exec(function(err, Exhibitor){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Exhibitor)
    	})
	},
	paginateFind: function(offset, page, callback){
		Exhibitor.find({}).sort({No:1}).skip((offset * page) - offset).limit(offset).exec(function(err, exhibitors){
			if(err){
				callback(err, null)
				return
			}
			callback(null, exhibitors)
		});
	},
	searchRecords: function(criteria, offset, page, callback){
		Exhibitor.find(criteria).sort({No:1}).skip((offset * page) - offset).limit(offset).exec(function(err, exhibitors){
			if(err){
				callback(err, null)
				return
			}
			callback(null, exhibitors)
		});
	},
	totalRecords: function(offset, callback){
		Exhibitor.count().exec(function(err, count) {
			if(err){
				callback(err, null)
				return
			}
			callback(null, count)
		});
	},
	update: function(criteria, dataToSet, options, callback){
    	Exhibitor.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Exhibitor.find(criteria).select(projection).exec(function(err, Exhibitor){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Exhibitor)
    	})
	},
	totalDocuments: function(query, callback){
		Exhibitor.count(query).exec(function(err, count) {
			if(err){
				callback(err, null)
				return
			}
			callback(null, count)
		});
	}
}
module.exports = ExhibitorController;