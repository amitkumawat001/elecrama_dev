var Contact = require('../../models/common/usercontacts');


const ContactControllers = {

	find: function(criteria, callback){
    	/*Contact.find(criteria).populate('Scaned_USER.item', {}).populate('Scaned_Exhibitor',{}).populate('Scaned_Visitor',{}).exec(function(err, contacts){
    		if(err){
				callback(err,null)
				return
			}
			 callback(null, contacts)
    	});*/
        Contact.find(criteria).populate('Scaned_Exhibitor',{}).populate('Scaned_Visitor',{}).exec(function(err, contacts){
            if(err){
                callback(err,null)
                return
            }
             callback(null, contacts)
        });
	},
	create: function(data, callback){
    	new Contact(data).save(function(err, data){
    		if(err){
    			callback(err, null)
    			return
    		}else{
    			Contact.findById(data.id).populate('Scaned_Exhibitor',{}).populate('Scaned_Visitor',{}).exec(function(err, user){
    				if(err){
    					callback(err, null)
    					return
    				}
    				callback(null, user)
    			})
    		}
    	});
	},

	update: function(criteria, dataToSet, options, callback){
    	Contact.findOneAndUpdate(criteria, dataToSet, options, callback);
	},

	destroy:function(){

	},
	findWithSelect: function(criteria, projection, options, callback){
    	Contact.find(criteria).select(projection).exec(function(err, contact){
    		if(err){
				callback(err,null)
				return
			}
			callback(null, contact)
    	})
	}
}
module.exports =ContactControllers;