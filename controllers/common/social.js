var Social = require('../../models/common/social');


const SocialController = {

	find: function(criteria, projection, options, callback){
    	Social.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new Social(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	Social.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(id, callback){
		Social.findByIdAndRemove(id, function(err, data){
			if(err){
				callback(err, null)
			}else{
				var response =  "Social link removed Succesfully";
				callback(null, response)
			}
		})
	},
	findWithSelect: function(criteria, projection, options, callback){
    	Social.find(criteria).select(projection).exec(function(err, social){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, social)
    	})
	}
}
module.exports =SocialController;