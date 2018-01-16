var models = require('../../models');
var TicketCategory = models.ticketcategory;


const TicketCategoryController = {

	find: function(criteria, projection, options, callback){
    	TicketCategory.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new TicketCategory(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	TicketCategory.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	TicketCategory.find(criteria).select(projection).exec(function(err, TicketCategory){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, TicketCategory)
    	})
	}
}
module.exports =TicketCategoryController;