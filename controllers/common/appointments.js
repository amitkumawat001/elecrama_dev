var Appointments = require('../../models/common/appointments');


const AppointmentsControllers = {

	find: function(criteria, callback){
    	Appointments.find(criteria).populate('Exhibitor_id', {}).populate('Visitor_id', {}).sort({_id:-1}).exec(function(err, appointments){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, appointments)
    	});
	},
	create: function(data, callback){
    	new Appointments(data).save(function(err, data){
    		if(err){
    			callback(err, null)
    			return
    		}else{
    			Appointments.findById(data.id).populate('Exhibitor_id', 'device_id os_type').exec(function(err, appointment){
    				if(err){
    					callback(err, null)
    					return
    				}
    				callback(null, appointment)
    			})
    		}
    	});
	},

	update: function(criteria, dataToSet, options, callback){
    	Appointments.findOneAndUpdate(criteria, dataToSet, options, function(err, appointment){
            if(err){
                callback(err, null)
                return
            }else{
                Appointments.find({_id:appointment.id}).populate('Exhibitor_id', 'device_id os_type').populate('Visitor_id', 'device_id os_type').exec(function(err, appointment){
                    if(err){
                        callback(err, null)
                        return
                    }else{
                        callback(null, appointment)
                    }
                })
            }
        });
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Appointments.find(criteria).select(projection).exec(function(err, Appointment){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, Appointment)
    	})
	},
    totalDocuments: function(query, callback){
        Appointments.count(query).exec(function(err, count) {
            if(err){
                callback(err, null)
                return
            }
            callback(null, count)
        });
    },
    RecentRecords: function(query, offset, callback){
        Appointments.find(query).sort({_id:-1}).limit(offset).exec(callback);
    }
}
module.exports =AppointmentsControllers;