var mongoose = require('mongoose');
TicketCategory = mongoose.Schema({
    title: {
        type: String
    }
});
module.exports = mongoose.model('TicketCategory', TicketCategory);