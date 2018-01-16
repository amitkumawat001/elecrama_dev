var EmergencyContacts = require('../../models/common/emergencycontacts');


const EmergencyContactsControllers = {

	find: function(criteria, projection, options, callback){
    	EmergencyContacts.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new EmergencyContacts(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	EmergencyContacts.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	EmergencyContacts.find(criteria).select(projection).exec(function(err, contacts){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, contacts)
    	})
	}
}
module.exports =EmergencyContactsControllers;