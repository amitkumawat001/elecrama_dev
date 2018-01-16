'use strict';
const Keys = require('./keys');
const Email_Mobile_Exists = 'Email or mobile number already registered';
const Visitor_created = 'Visitor has been successfully created';
const Visitor_unableToCreate ='Unable to create visitor';
const Missing_Parameter = 'Some Parameters are missing';
const EmailID_NotRegistered = 'Email or mobile number is not registered';
const Password_Mismatch = 'Password is incorrect';
const unableToRegisterStall ='Unable to register stall' ;
const unableToCreateAppointment = 'Unable to create an appointment';
const visitor_min_distance = 2; //In meters 
const Visitor_loc_updated = 'Visitor Location has been updated';
const Visitor_loc_unableToUpdate = 'Unable to update visitor location';
const Visitor_loc_created = 'Visitor current location created';
const Visitor_loc_unableToCreate = 'Unable to create visitor current location';
const Appointment_Status = {
	PENDING : 'PENDING',
	APPROVED : 'APPROVED',
	REJECTED : 'REJECTED',
	CANCELLED : 'CANCELLED',
	FINISHED : 'FINISHED',
};
const NoAppointmentsFound = 'No Appointments found';
const UnableToUpdateStatus = 'Unable to Update Status';
const UnableToAddFav = 'Unable to Add in Fav list';
const EmptyFavList = 'Empty Fav list';
const UnableToUpdateFav = 'Unable to Update Fav List';
const ExhibitorTimeSlot = {
	start_time : '9:30',
	end_time : '23:30',
	hours : '2'
};
const EmergencyContacts = {
	Police : "100",
	Fire : "101",
	Ambulance : "102"
};

const USER_TYPES = {
	VISITOR : "VISITOR",
	HALL_MANAGER : "HALL MANAGER",
	HALL_DIRECTOR : "HALL DIRECTOR",
	VENDOR : "VENDOR",
	SPEAKER : "SPEAKER",
	ADMIN : "ADMIN",
	EXHIBITOR: "EXHIBITOR",
 };
 const OTP_LENGTH = {
 	min:1000,
 	max: 9999
 };
const OPENFIRE_BASEGID = 'http://ramscreative.com';
const OPENFIRE_CREATEUSER = 'http://ramscreative.com/9090/plugins/restapi/v1/users';
const Notification_type = {
	APPOINTMENT : 'APPOINTMENT',
	TICKET : 'TICKET'
};
const Notification_message = {
	NEW_TICKET: 'New Ticket has been created !',
	TICKET_FINISH : 'Ticket has been finsihed by Vendor',
	TICKET_ASSIGN : 'A new ticket assigned',
	TICKET_CLOSE : 'Ticket Closed by Exhibitor',
	TICKET_UPDATE : 'Ticket Updated by Exhibitor',
}
const SmsGateWayBaseUrl = 'https://alerts.solutionsinfini.com/api/v4/?api_key='+Keys.SMSgateWAYKey;
module.exports = {
	Email_Mobile_Exists,
	Visitor_created,
	Visitor_unableToCreate,
	Missing_Parameter,
	EmailID_NotRegistered,
	Password_Mismatch,
	unableToRegisterStall,
	unableToCreateAppointment,
	visitor_min_distance,
	Visitor_loc_updated,
	Visitor_loc_created,
	Visitor_loc_unableToCreate,
	Appointment_Status,
	NoAppointmentsFound,
	UnableToUpdateStatus,
	UnableToAddFav,
	EmptyFavList,
	UnableToUpdateFav,
	ExhibitorTimeSlot,
	EmergencyContacts,
	USER_TYPES,
	OTP_LENGTH,
	OPENFIRE_BASEGID,
	OPENFIRE_CREATEUSER,
	Notification_type,
	SmsGateWayBaseUrl,
	Notification_message,
};