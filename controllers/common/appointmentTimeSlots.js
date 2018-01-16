var TimeSlots = require('../../models/common/appointmentTimeSlots');


const AppointmentTimeSlotController = {

	find: function(criteria, projection, options, callback){
    	TimeSlots.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new TimeSlots(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	TimeSlots.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	TimeSlots.find(criteria).select(projection).exec(function(err, timeslot){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, timeslot)
    	})
	}
}
module.exports =AppointmentTimeSlotController;