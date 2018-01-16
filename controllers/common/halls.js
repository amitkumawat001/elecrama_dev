var Hall = require('../../models/common/halls');


const HallController = {

	find: function(criteria, callback){
    	Hall.find(criteria).populate('Hall_director', "id first_name middle_name last_name salutation").populate('Hall_managers', "id first_name middle_name last_name salutation").exec(function(err, halls){
    		if(err){
    			callback(err, null)
    			return
    		}
    		callback(null, halls)
    	});
	},
    findOne: function(criteria, callback){
        Hall.findOne(criteria).populate('Hall_director', "id first_name middle_name last_name salutation").populate('Hall_managers', "id first_name middle_name last_name salutation").exec(function(err, hall){
            if(err){
                callback(err, null)
                return
            }
            callback(null, hall)
        });
    },
	create: function(data, callback){
    	new Hall(data).save(function(err, data){
    		if(err){
    			callback(err, null)
    			return
    		}else{
    			Hall.findById(data.id).populate('Hall_director', "id first_name middle_name last_name salutation").populate('Hall_managers', "id first_name middle_name last_name salutation").exec(function(err, hall){
    				if(err){
    					callback(err, null)
    					return
    				}
    				callback(null, hall)
    			})
    		}
    	});
	},

	update: function(criteria, dataToSet, options, callback){
    	Hall.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Hall.find(criteria).select(projection).exec(function(err, halls){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, halls)
    	})
	},
    findOneWithSelect: function(criteria, projection, options, callback){
        Hall.find(criteria).select(projection).limit(1).exec(function(err, halls){
            if(err){
                callback(err,null)
                return
            }
            callback(null, halls)
        })
    }
}
module.exports =HallController;