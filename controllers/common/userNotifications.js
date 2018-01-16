var userNotification = require('../../models/common/userNotifications');


const UserNotificationController = {

	find: function(criteria, projection, options, callback){
    	userNotification.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new userNotification(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	userNotification.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	userNotification.find(criteria).select(projection).sort({_id:-1}).exec(function(err, notification){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, notification)
    	})
	},
    paginateFind: function(criteria, offset, page, callback){
        userNotification.find(criteria).sort({_id:-1}).skip((offset * page) - offset).limit(offset).exec(function(err, notifications){
            if(err){
                callback(err, null)
                return
            }
            callback(null, notifications)
        });
    }
}
module.exports =UserNotificationController;