var ElecaramaTv = require('../../models/common/elecramaTv');


const ElecaramaTvController = {

	find: function(criteria, projection, options, callback){
    	ElecaramaTv.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new ElecaramaTv(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	ElecaramaTv.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	ElecaramaTv.find(criteria).select(projection).exec(function(err, elecaramaTv){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, elecaramaTv)
    	})
	}
}
module.exports =ElecaramaTvController;