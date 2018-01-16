var Visitor_fav = require('../../models/visitor/visitor_fav');

const VisitorFavController = {

	find: function(criteria, callback){
    	Visitor_fav.find(criteria).populate('Fav_Exhibitors', {}).exec(function(err, fav_list){
    		if(err){
    			callback(err,null)
				return
    		}
    		callback(null, fav_list)
    	});
	},
	findwithoutpopulate : function(criteria, callback){
		Visitor_fav.find(criteria, function(err, favs){
			if(err){
				callback(err, null)
				return
			}
			callback(null, favs)
		});
	},
	findOne: function(params, callback){
		Visitor_fav.findOne(params,function(err, visitor_fav){
			if(err){
				callback(err,null)
				return
			}
			callback(null, visitor_fav)
		})
	},
	create: function(data, callback){
    	new Visitor_fav(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	Visitor_fav.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	}
}
module.exports = VisitorFavController;