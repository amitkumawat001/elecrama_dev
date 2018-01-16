var mongoose = require('mongoose');

var TimeSlots = new mongoose.Schema({
	Start_time : String,
	End_time : String,
	duration : String
},
	{timestamps:true}
);

module.exports = mongoose.model('AppointmentTimeSlots', TimeSlots);