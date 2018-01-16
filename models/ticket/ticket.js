var mongoose = require('mongoose');
var Ticket = mongoose.Schema({
    ticketno: {
        type: String
    },
    exhibitor: {
       type: mongoose.Schema.Types.ObjectId,
        ref: 'Exhibitor'
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    hall: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Halls'
    },
    stall_no:{
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketCategory'
    },
    message: {
        type: String
    },
    remark:{
        type: String
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    },
    hall_manager_for_ticket:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    },
    hall_managers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    }],
    hall_director:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor'
    },
    status: {
        type: String,
        enum: ['OPEN', 'ASSIGNED', 'REOPEN', 'DONE'],
        default: 'OPEN'
    },
    action_taken: {
        type: String,
        enum: ['true', 'false'],
        default: 'false'
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('Ticket', Ticket);