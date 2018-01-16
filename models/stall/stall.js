var mongoose = require('mongoose');
var Stall = new mongoose.Schema({
    stall_name:{type:String},
    lat:{type:String},
    lng:{type:String},
    acc:{type:String},
    alt:{type:String}
},
    {timestamps:true}
);

module.exports = mongoose.model('Stall', Stall);