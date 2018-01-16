var Invite = require('../../models/exhibitor/invites');


const InviteController = {

	find: function(criteria, projection, options, callback){
    	Invite.find(criteria, projection, options, callback);
	},
	create: function(data, callback){
    	new Invite(data).save(callback);
	},

	update: function(criteria, dataToSet, options, callback){
    	Invite.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Invite.find(criteria).select(projection).exec(function(err, invite){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, invite)
    	})
	}
}
module.exports =InviteController;