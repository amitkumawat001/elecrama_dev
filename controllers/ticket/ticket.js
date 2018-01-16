var models = require('../../models');
var Ticket = models.ticket;


const TicketController = {

    countRows: function (callback) {
        Ticket.count(({}), function (err, count) {
            if (err) {
                callback(err,null);
                throw err;
            } else {
                callback(null,count);
            }
        })
    },
    find: function (criteria, callback) {
        Ticket.find(criteria).populate('hall', 'Hall_title').populate('category', 'title').populate('vendor', 'first_name last_name middle_name salutation openfire_gid mobile_number').populate('exhibitor', 'PERSON_NAME COMPANY_NAME MOBILE openfire_gid').populate('hall_manager_for_ticket', 'os_type device_id openfire_gid mobile_number first_name last_name middle_name salutation').sort({_id:-1}).exec(callback);
    },
    findOne: function (criteria, projection, callback) {
        Ticket.find(criteria).select(projection).limit(1).exec(callback);
    },
    create: function (data, callback) {
        new Ticket(data).save(function (err, ticket) {
            if (err) {
                callback(err, null);
               return
            } else {
                Ticket.find({
                    _id: ticket.id
                }).populate('hall_managers', 'os_type device_id openfire_gid first_name last_name salutation mobile_number').limit(1).exec(function (err, ticket) {
                    //populate('exhibitor', {}).populate('hall', {})
                    if (err) {
                        callback(err, null)
                        return
                    } else {
                        callback(null, ticket)
                    }
                })
            }
        });
    },

    update: function (criteria, dataToSet, options, callback) {
        Ticket.findOneAndUpdate(criteria, dataToSet, options, function(err, data){
            if(err){
                callback(err, null)
                return
            }else{
                Ticket.find({_id:data.id}).populate('vendor', 'os_type device_id first_name last_name middle_name salutation mobile_number openfire_gid').populate('exhibitor', 'os_type device_id MOBILE PERSON_NAME openfire_gid').populate('hall_manager_for_ticket', 'os_type device_id first_name last_name middle_name salutation mobile_number openfire_gid').limit(1).exec(callback)
            }
        });
    },

    destroy: function () {

    },
    findWithSelect: function (criteria, projection, options, callback) {
        Ticket.find(criteria).select(projection).exec(function (err, Ticket) {
            if (err) {
                callback(err, null)
                return
            }
            callback(null, Ticket)
        })
    },
    totalDocuments: function(query, callback){
        Ticket.count(query).exec(function(err, count) {
            if(err){
                callback(err, null)
                return
            }
            callback(null, count)
        });
    },
    RecentRecords: function(query, offset, callback){
        Ticket.find(query).sort({_id:-1}).limit(offset).exec(callback);
    }
}
module.exports = TicketController;