var mongoose = require('mongoose');
var Constants = require('../../Config/constants');
var Appointment_Status =  Constants.Appointment_Status;

var Appointments = new mongoose.Schema({
	Exhibitor_id : {type: mongoose.Schema.Types.ObjectId, ref: 'Exhibitor'},
	Visitor_id : {type: mongoose.Schema.Types.ObjectId, ref: 'Visitor'},
	Appointment_date : String,
	Timeslot : String,
	Appointment_Reason : String,
	Status : { type: String, enum : [Appointment_Status.PENDING,Appointment_Status.APPROVED, Appointment_Status.REJECTED, Appointment_Status.CANCELLED, Appointment_Status.FINISHED], default: Appointment_Status.PENDING},
},
	{timestamps:true}
);

module.exports = mongoose.model('Appointments', Appointments);