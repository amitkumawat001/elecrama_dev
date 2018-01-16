var About = require('../../models/common/aboutus');


const AboutUsController = {

	find: function(criteria, projection, options, callback){
    	About.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new About(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	About.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	About.find(criteria).select(projection).exec(function(err, about){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, about)
    	})
	}
}
module.exports =AboutUsController;