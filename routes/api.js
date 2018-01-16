var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt=require('jsonwebtoken');
var randomstring = require('randomstring');
var QRCode = require('qrcode');
var Config = require('../Config');
var geolib = require('geolib');
var path = require('path');
var Array2d = require('array-2d');
var XLSX = require('xlsx');
var nodemailer = require('nodemailer');
var request = require('request');
var async = require('async');
var gcm = require('node-gcm');
var multer = require('multer');
var constants = Config.constants;
var keys = Config.keys;
var ServerInfo = Config.serverInfo;
var ServerBaseUrl = ServerInfo.ServerBaseUrl;
var Controllers = require('../controllers');
var Exhibitor = Controllers.exhibitor;
var Visitor = Controllers.visitor;
var Visitor_tracker = Controllers.visitor_tracker;
var Stall = Controllers.stall;
var Appointment = Controllers.appointments;
var Keylocation = Controllers.keylocations;
var Visitor_fav = Controllers.visitor_fav;
var Ticket = Controllers.ticket;
var TicketCategory = Controllers.ticketcategory;
var EmergencyContacts = Controllers.emergency_contacts;
var AppointmentTimeSlots = Controllers.appointmentTimeSlots;
var ElecaramaTv = Controllers.elecaramaTv;
var Contact = Controllers.contact;
var Hall = Controllers.halls;
var AboutUS =  Controllers.aboutus;
var Social = Controllers.social;
var Invite = Controllers.invites;
var StallVisitor =  Controllers.stallvisited;
var UserNoticiation = Controllers.usernotification;
var transporter = nodemailer.createTransport({
	service: 'Gmail',
  	auth: {
       	user: 'nodetesterexp@gmail.com', 
       	pass: 'rtu@13EMTCS011'
   	},
   	tls: { rejectUnauthorized: false }
});
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

var GCMsender = new gcm.Sender(keys.GCMServerKey);

var Storage = multer.diskStorage({
    destination: function (req, file, callback) {

        callback(null, "public/images/user_profiles");
    },
    filename: function (req, file, callback) {
    	img_path = file.path;
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
var upload = multer({ storage: Storage });

var Storage_common = multer.diskStorage({
    destination: function (req, file, callback) {

        callback(null, "public/images");
    },
    filename: function (req, file, callback) {
    	img_path = file.path;
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload_common =  multer({storage: Storage_common});

//Post Requests
router.post('/:identifier/:resource', upload.any(), function(req, res){
	var resource = req.params.resource;
	var identifier = req.params.identifier;
	if(identifier == 'visitor'){
		if(resource == 'register'){
			var params = req.body;
			if (params.email && params.mobile_number && params.USER_TYPE){
				Visitor.findOne({$or: [ { email : params.email }, { mobile_number : params.mobile_number } ]}, function(err, visitor) {
					if(err){
						console.log(err);
						res.status(200).json({success:false, message:err});
					}else{
						if(visitor){
							res.status(200).json({success:false, message:constants.Email_Mobile_Exists})
						}else{
							Exhibitor.findOne({$or: [{EMAIL : params.email}, {MOBILE: params.mobile_number}]}, function(err, exhibitor){
								if(err){
									console.log(err)
									res.status(200).json({success:false, message:err})
								}else{
									if(exhibitor){
										res.status(200).json({success:false, memssage:constants.Email_Mobile_Exists})
									}else{
										var qr_original;
										//params.password = createhash(params.password);
										
										var Openfire = Openfire_GID(params.mobile_number, keys.openfireKeyForAllUser);
										console.log(Openfire);
										params.openfire_gid = Openfire;
										params.openfire_password = keys.openfireKeyForAllUser;
										var qr_name = Date.now()+'.png';
										var token = jwt.sign({ Email: params.email, USER_TYPE: params.USER_TYPE , mobile_number:params.mobile_number}, keys.JWTSecretKey );
										QRCode.toFile(path.join(__dirname, '../public')+'/images/Qrcode/'+qr_name, token, {}, function(err){
				  							if (err) {
				  								throw err
				  							}
										});
										qr_original ='/images/Qrcode/'+qr_name;
				  						params.qr_image = qr_original;
				  						params.access_token = token;
										Visitor.create(params, function(err, visitor){
											if(err){
												console.log(err);
												res.status(200).json({success:false, message:err});
											}else{
												if(visitor){
													res.status(201).json({success:true, message:constants.Visitor_created, data:visitor});
												}else{
													console.log('unable to create visitor');
													res.status(200).json({success:false, message:constants.Visitor_unableToCreate})
												}
											}
										});
									}
								}
							})
						}
					}
				});

			}else{
				res.status(200).json({success:false, message:constants.Missing_Parameter});
			}
		}
		if(resource == 'login'){
			if (req.body.email || req.body.mobile_number) {
				console.log(req.body.email);
        		Visitor.findOne({$or :[{'email': req.body.email }, {'mobile_number' : req.body.mobile_number}]}, function(err, visitor) {
           			if (err) {
                		res.status(200).json({ success: false, message: err });
            		} else{
            			if (visitor) {
                			/*if (comparePassword(req.body.password, visitor.password)) {
                    			res.status(200).json({ success: true, data: visitor });
                			} else {
                    			res.status(200).json({ success: false, message: constants.Password_Mismatch });
               				}*/
               				//console.log(visitor)
               				var OTP = OTP_genrate();
               				if(OTP){
               					if(req.body.device){
			               			var device = req.body.device;
			               		}else{
			               			var device = '';
			               		}
			               		if(req.body.os_type){
			               			var os_type = req.body.os_type;
			               		}else{
			               			var os_type = '';
			               		}
			               		if(req.body.device_id){
			               			var device_id = req.body.device_id;
			               		}else{
			               			var device_id = '';
			               		}
               					Visitor.update({_id:visitor.id}, {OTP:OTP, Is_Verified:false, device:device, os_type:os_type, device_id:device_id}, {new:true}, function(err, visitor_update){
               						if(err){
               							res.status(200).json({success:false, message:err})
               						}else{
               							if(visitor_update){
               								console.log(visitor_update)
               								var mailOptions = {
											    from: 'amitkumawat238@gmail.com', // sender address
											    to: visitor_update.email, // list of receivers
											    subject: 'One Time Password :- Elecrama 2018', // Subject line
											    html: '<b>Hello,</b><br>Your One time password for Elecrama Login is : '+visitor_update.OTP // You can choose to send an HTML body instead
											};
               								transporter.sendMail(mailOptions, function(err, info){
											    if(err){
											        console.log(err);
											        res.status(200).json({success:false, message:err});
											    }else{
											        console.log('Message sent: ' + info.response);
											        var user = {
											        	id:visitor_update.id,
											        	user_type:visitor_update.USER_TYPE
											        };
											       	res.status(200).json({success:true, message:"OTP has been sent successfully !", data:user})
											    };
											});
               							}
               						}
               					})
               				}else{

               				}
            			}else{
            				Exhibitor.findOne({$or:[{'EMAIL':req.body.email}, {'MOBILE' : req.body.mobile_number}]}, function(err, exhibitor){
            					if(err){
            						res.status(200).json({success:false, message:err})
            					}else{
            						if(exhibitor){
            							console.log(exhibitor)
			               				var OTP = OTP_genrate();
			               				if(OTP){
			               					if(req.body.device){
			               						var device = req.body.device;
			               					}else{
			               						var device = '';
			               					}
			               					if(req.body.os_type){
			               						var os_type = req.body.os_type;
			               					}else{
			               						var os_type = '';
			               					}
			               					if(req.body.device_id){
			               						var device_id = req.body.device_id;
			               					}else{
			               						var device_id = '';
			               					}
			               					Exhibitor.update({_id:exhibitor.id}, {OTP:OTP, Is_Verified:false, device:device, os_type:os_type, device_id:device_id}, {new:true}, function(err, exhibitor_update){
			               						if(err){
			               							res.status(200).json({success:false, message:err})
			               						}else{
			               							if(exhibitor_update){
			               								console.log(exhibitor_update)
			               								var mailOptions = {
														    from: 'amitkumawat238@gmail.com', // sender address
														    to: exhibitor_update.EMAIL, // list of receivers
														    subject: 'One Time Password :- Elecrama 2018', // Subject line
														    html: '<b>Hello,</b><br>Your One time password for Elecrama Login is : '+exhibitor_update.OTP // You can choose to send an HTML body instead
														};
			               								/*transporter.sendMail(mailOptions, function(err, info){
														    if(err){
														        console.log(err);
														        res.status(200).json({success:false, message:err});
														    }else{
														        console.log('Message sent: ' + info.response);
														        var user = {
											        				id:exhibitor_update.id,
											        				user_type:'EXHIBITOR'
											        			};
														       	res.status(200).json({success:true, message:"OTP has been sent successfully !", data:user})
														    };
														});*/
			               							}
			               						}
			               					})
			               				}else{

			               				}
            						}else{
            							res.status(200).json({ success: false, message: constants.EmailID_NotRegistered})
            						}
            					}
            				})
            			}
            		}
        		});
    		}else{
        		res.status(200).json({ success: false, message: constants.Missing_Parameter });
    		}
		}
		if(resource == 'verify-otp'){
			if(req.body.User_id && req.body.OTP){
				Visitor.findOne({_id:req.body.User_id}, function(err, visitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitor){
							console.log(visitor)
							if(req.body.OTP == visitor.OTP){
								Visitor.update({_id:req.body.User_id}, {Is_Verified:true}, {new:true}, function(err, visitor_update){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(visitor_update){
											res.status(200).json({success:true, data:visitor_update})
										}else{
											console.log("Unable to Update Visitor in DB")
										}
									}
								})
							}else{
								res.status(200).json({success:false, message:"OTP Mismatch"})
							}
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'location'){
			if(req.body.visitor_id && req.body.lat && req.body.lng && req.body.altitude){
				Visitor_tracker.find({'visitor_id': req.body.visitor_id}, function(err, visitor){
					if(err){
						res.status(200).json({ success: false, message: err });
					}else{
						console.log(visitor);
						if(visitor.length){
							console.log(visitor.length);
							var visitor_loc_lng = visitor[0].lng;
							var visitor_loc_lat = visitor[0].lat;
							console.log(visitor[0].lat);
							var distance = geolib.getDistance({latitude: parseFloat(req.body.lat), longitude: parseFloat(req.body.lng) }, {latitude: parseFloat(visitor_loc_lat), longitude: parseFloat(visitor_loc_lng)});
							console.log(distance);
							var min_distance = constants.visitor_min_distance;
							if(distance<min_distance){
								console.log('Same position of visitor');
								res.status(200).json({success:true});
							}else{
								Visitor_tracker.create(req.body, function(err, visitor){
								if(err){
									console.log(err);
									res.status(200).json({success:false, message:err});
								}else{
									if(visitor){
										console.log(visitor);
										//Check Stall location and User Location 
										//res.status(201).json({success:true, message:constants.Visitor_loc_created, data:visitor});
										Polygons2(function(err, data){
											if(err){
												res.status(200).json({success:false, message:err})
											}else{
												checkStallWithUser(req.body.visitor_id, data, req.body.lat, req.body.lng, function(err, Isinside){
													if(err){
														res.status(200).json({success:false, message:err})
													}else{
														res.status(200).json({success:true, data:Isinside})
													}
												})
											}
										})
									}else{
										console.log('unable to update location');
										res.status(200).json({success:false, message:constants.Visitor_loc_unableToCreate})
									}
								}
								})
							}
						}else{
							console.log("No Records found");
							Visitor_tracker.create(req.body, function(err, visitor){
								if(err){
									console.log(err);
									res.status(200).json({success:false, message:err});
								}else{
									if(visitor){
										console.log(visitor);
										res.status(201).json({success:true, message:constants.Visitor_loc_created, data:visitor});
									}else{
										console.log('unable to update location');
										res.status(200).json({success:false, message:constants.Visitor_loc_unableToCreate})
									}
								}
								})
						}
					}
				})
				
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'favourites'){
			var options = {
				new:true
			};
			if(req.body.Visitor_id && req.body.Exhibitor_id && req.body.Is_fav){
				Visitor_fav.findOne({Visitor_id:req.body.Visitor_id}, function(err, favs){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						console.log(favs);
						if(favs){
							//Update Fav
							if(req.body.Is_fav == 'true'){
								Visitor_fav.update({Visitor_id:req.body.Visitor_id},{$push:{'Fav_Exhibitors':req.body.Exhibitor_id}},options,function(err, favs){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(favs){
											Exhibitor.update({_id:req.body.Exhibitor_id},{$push:{"fav_vistors" : req.body.Visitor_id}}, options, function(err, fav){
												if(err){
													res.status(200).json({success:false, message:true})
												}else{
													if(fav){
														res.status(200).json({success:true, data:favs})
													}else{
														res.status(200).json({success:false, message:constants.UnableToAddFav})
													}
												}
											})
											
										}else{
											res.status(200).json({success:false, message:constants.UnableToAddFav})
										}
									}
								})
								
							}else if(req.body.Is_fav == 'false'){
								Visitor_fav.update({Visitor_id:req.body.Visitor_id},{$pull:{'Fav_Exhibitors':req.body.Exhibitor_id}},options,function(err, favs){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(favs){
											Exhibitor.update({_id:req.body.Exhibitor_id},{$pull:{"fav_vistors" : req.body.Visitor_id}}, options, function(err, fav){
												if(err){
													res.status(200).json({success:false, message:true})
												}else{
													if(fav){
														res.status(200).json({success:true, data:favs})
													}else{
														res.status(200).json({success:false, message:constants.UnableToAddFav})
													}
												}
											})
										}else{
											res.status(200).json({success:false, message:constants.UnableToAddFav})
										}
									}
								})
			
							}
						}else{
							//Create Favs
							if(req.body.Is_fav == 'true'){
								req.body.Fav_Exhibitors = req.body.Exhibitor_id;
								Visitor_fav.create(req.body, function(err, favs){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(favs){
											res.status(200).json({success:true, data:favs})
										}else{
											res.status(200).json({success:false, message:constants.UnableToAddFav})
										}
									}
								})
							}
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'update-profile'){
			var ImagesDir ='/images/user_profiles/';
			var options = {
				new:true
			};
			if(req.files){
				var upload_files = req.files;
				for(var i=0; i<upload_files.length; i++){
					if(upload_files[i]['fieldname'] == 'profile_pic'){
						req.body.profile_pic = ImagesDir + upload_files[i]['filename'];
					}
				}
			}
			if(req.body.User_id){
				console.log(req.body)
				Visitor.update({_id:req.body.User_id}, req.body, options, function(err, visitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitor){
							res.status(200).json({success:true, data:visitor})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
	}
	//Exhibitor's Endpoints 
	if(identifier == 'exhibitor'){
		if(resource == 'login'){
			if (req.body.email && req.body.password) {
        		Exhibitor.findOne({ email: req.body.email }, function(err, exhibitor) {
           			if (err) {
						   //server Error
                		res.status(200).json({ success: false, message: err })
            		} else{
            			if (exhibitor) {
                			if (comparePassword(req.body.password, exhibitor.password)) {
                    			res.status(200).json({ success: true, data: exhibitor });
                			} else {
                    			res.status(200).json({ success: false, message: constants.Password_Mismatch });
               				}
            			}else{
                			res.status(200).json({ success: false, message: constants.EmailID_NotRegistered})
            			}
            		}
        		});
    		}else{
        		res.status(200).json({ success: false, message: constants.Missing_Parameter });
    		}
		}
		/*
		if(resource == 'import_excel'){
			var data = excelToJson();
			console.log(data.length);
			//res.json(data);
			for(var inc=0; inc<data.length; inc++){
					//console.log('second :'+inc);
					if(data[inc]==null || data[inc] == undefined){
						
					}else{
					
					    Exhibitor.create(data[inc], function(err, exhibitors){
					    	//console.log('first :'+inc);
					    	if(err){
					    		console.log("Error: "+err);
					    		//res.status(200).json({success:false, meassage:err});
					    	}else{
					    		if(exhibitors){
					    			
					    			//res.status(201).json({success:true, data:exhibitors});
					    		}else{
				    				console.log("Unable to import data");
				    				//res.status(200).json({success:false, message:"unable to import data"});
				    			}
				    		}
				    	});
					}
				}
			
		}*/
		if(resource == 'favourites'){
			var options = {new:true};
			if(req.body.Visitor_id && req.body.Is_fav && req.body.Exhibitor_id){
				if(req.body.Is_fav == 'true'){
					Exhibitor.update({_id:req.body.Exhibitor_id},{$push:{"fav_vistors" : req.body.Visitor_id}}, options, function(err, fav){
						if(err){
							res.status(200).json({success:false, message:true})
						}else{
							if(fav){
								res.status(200).json({success:true, data:fav})
							}else{
								res.status(200).json({success:false, message:constants.UnableToAddFav})
							}
						}
					})
				}else if(req.body.Is_fav == 'false'){
					Exhibitor.update({_id:req.body.Exhibitor_id},{$pull:{"fav_vistors" : req.body.Visitor_id}}, options, function(err, fav){
						if(err){
							res.status(200).json({success:false, message:true})
						}else{
							if(fav){
								res.status(200).json({success:true, data:fav})
							}else{
								res.status(200).json({success:false, message:constants.UnableToAddFav})
							}
						}
					})
				}else{
					res.status(200).json({success:false, message:constants.UnableToAddFav})
				}
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'update-profile'){
			var options = {
				new:true
			};
			var ImagesDir ='/images/user_profiles/';
			var BrochureDir ='/images/user_profiles/';
			var upload_files = req.files;
			console.log(req.files)
			if(req.files){
			for(var i=0; i<upload_files.length; i++){
				if(upload_files[i]['fieldname'] == 'profile_pic'){
					req.body.profile_pic = ImagesDir + upload_files[i]['filename'];
				}
				if(upload_files[i]['fieldname'] == 'Brochure_url'){
					req.body.Brochure_url = BrochureDir + upload_files[i]['filename'];
				}
			}
			}
			if(req.body.User_id){
				console.log(req.body)
				Exhibitor.update({_id:req.body.User_id}, req.body, options, function(err, exhibitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(exhibitor){
							res.status(200).json({success:true, data:exhibitor})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'generate_qrcode'){
			Exhibitor.find({}, function(err, exhibitors){
				if(err){
					console.log(err)
					res.status(200).json({success:false, message:err})
				}else{
					if(exhibitors){
						for(var i=0; i<exhibitors.length; i++){
							var qr_name = Date.now()+'.png';
							var token = jwt.sign({ Email: exhibitors[i].EMAIL, USER_TYPE: 'EXHIBITOR' , mobile_number:exhibitors[i].MOBILE}, keys.JWTSecretKey );
							QRCode.toFile(path.join(__dirname, '../public')+'/images/Qrcode/'+qr_name, token, {}, function(err){
				  				if (err) {
				  					console.log(err);
				  					return
				  				}else{
				  					console.log("Succes Qr image")
				  				}
							});
							var qr_original ='/images/Qrcode/'+qr_name;
				  			var exhibitor_qr_image = qr_original;
				  			var exhibitor_access_token = token;
				  			Exhibitor.update({_id:exhibitors[i].id}, {qr_image:exhibitor_qr_image,access_token:exhibitor_access_token},{new:true}, function(err, exhibitor){
				  				if(err){
				  					console.log(err)
				  				}else{
				  					console.log("Success : "+i)
				  				}
				  			})
						}
					}
				}
			})
		}
		if(resource == 'invite'){
			if(req.body.exhibitor && (req.body.mobile_numbers || req.body.emails) && req.body.message && (req.body.Hall_no || req.body.Stall_no)){
				Invite.create(req.body, function(err, invite){
					if(err){
						res.status(200).json({success:false, meassage:err})
					}else{
						if(req.body.mobile_numbers){
							for(var i=0; i<req.body.mobile_numbers.length; i++){

								SMSOTP(req.body.message, req.body.mobile_numbers[i]);
							}
						}
						if(req.body.emails){
							EMAILOTP(req.body.message, req.body.emails);
						}
						res.status(200).json({success:true, data:invite})
					}
				})
			}else{
				res.status(200).json({success:false, message:constants.Missing_Parameter})
			}
		}
	}

	if(identifier=='stall'){
		if(resource=='locationupdate'){
			if(req.body){
				console.log(req.body);
				Stall.create(req.body,function(err,stall)
				{
					if(err)
					{
						res.status(200).json({ success: false, message: err });
					}
					else 
					{
  						if(stall)
  						{
  							res.status(201).json({ success: true, data: stall});
  						}
  						else
  						{
  							res.status(200).json({ success: false, message: constants.unableToRegisterStall });
  						}
					}
				});
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });	
			}
		}
	}
	if (identifier == 'ticket') {
		if (resource == 'createticket') {
			if (req.body.exhibitor && req.body.hall) {
				var TicketNo = "ELC0000";
				Hall.findWithSelect({_id:req.body.hall}, {Hall_managers:1, Hall_director:1,  _id:-1}, {new:true}, function(err, managers){
					if(err){
						console.log(err)
					}else{
						//console.log('mangers:'+managers)
						var hall_managers = managers[0].Hall_managers;
						if(managers[0]['Hall_director']){
							req.body.hall_director = managers[0].Hall_director;
						}
						//console.log(hall_managers)
						Ticket.countRows(function (err, count) {
							if (err) {
								res.status(200).json({
									sucess: false,
									message: err
								});
							} else {
								count = count + 1;
								TicketNo = TicketNo + count;
								req.body.ticketno = TicketNo;
								req.body.hall_managers = hall_managers;
								Ticket.create(req.body, function (err, ticket) {
									if (err) {
										res.status(200).json({
											success: false,
											message: err
										});
									} else {
										if(ticket[0]['hall_managers']){
											for(var i=0; i<ticket[0]['hall_managers'].length; i++){
												
												if(ticket[0]['hall_managers'][i]['os_type'] && ticket[0]['hall_managers'][i]['device_id']){
													var os_type = ticket[0]['hall_managers'][i]['os_type'];
													var device_id = ticket[0]['hall_managers'][i]['device_id'];
													var type = constants.Notification_type.TICKET;
													var message = constants.Notification_message.NEW_TICKET;
													var message1 = ticket;
													var To_user = ticket[0]['hall_managers'][i]['id'];
													var From_User = req.body.exhibitor;
													GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
												}
												
											}
										}
										res.status(200).json({
											success: true,
											data: ticket
										});
									}
								});
							}

						});
					}
				});
			} else {
				res.status(200).json({
					success: false,
					message: constants.Missing_Parameter
				})
			}
		}
		if(resource == 'assign-ticket'){
			if(req.body.manager_id && req.body.vendor_id && req.body.ticket_id){
				
				var vendor = req.body.vendor_id;
				var ticket_id  = req.body.ticket_id;
				Ticket.findOne({_id:ticket_id}, {vendor:1}, function(err, ticket){
					if(err){
						res.status(200).json({
							success: false,
							err: err
						});
					}else{
						console.log(ticket);
						if(ticket[0]['vendor']){
							res.status(200).json({success:false, message:"Ticket already assigned !"})
						}
						else{
							var status = 'ASSIGNED';
							Ticket.update({_id:req.body.ticket_id}, {status:status, vendor:vendor, hall_manager_for_ticket:req.body.manager_id}, {new:true}, function(err, updated_ticket){
								if(err){
									res.status(200).json({success:false, message:err})
								}else{
									
									if(updated_ticket[0]['vendor']['os_type'] && updated_ticket[0]['vendor']['device_id']){
										var os_type =  updated_ticket[0]['vendor']['os_type'];
										var device_id = updated_ticket[0]['vendor']['device_id'];
										var type = constants.Notification_type.TICKET;
										var message =  constants.Notification_message.TICKET_ASSIGN;
										var message1 = updated_ticket[0];
										var To_user = updated_ticket[0]['vendor']['id'];
										var From_User = req.body.manager_id;
										GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
									}
									
									res.status(200).json({success:true, data:updated_ticket[0]})
								}
							})
						}
					}
				})
			}else{
				res.status(200).json({
					success: false,
					message: constants.Missing_Parameter
				});
			}
		}
		if(resource == 'update-ticket'){
			console.log('update-ticket')
			if((req.body.ticket_id && req.body.vendor_id && req.body.remark && req.body.status) || (req.body.message && req.body.exhibitor_id && req.body.status && req.body.ticket_id)){
				Ticket.find({_id:req.body.ticket_id}, function(err, ticket){
					if(err){
						res.status(200).json({
							success: false,
							message: err
						});
					}else{
						console.log(ticket);
						if(ticket && ticket.length>0){
							if(ticket[0]['status'] == 'ASSIGNED' && req.body.vendor_id){
								Ticket.update({_id:req.body.ticket_id}, {status:req.body.status, remark:req.body.remark}, {new:true}, function(err, updated_ticket){
									if(err){
										res.status(200).json({success:false, messages:err})
									}else{
										var type = constants.Notification_type.TICKET;
										var message = constants.Notification_message.TICKET_FINISH;
										var message1 = updated_ticket[0];

										if(updated_ticket[0]['exhibitor'] && updated_ticket[0]['exhibitor']['device_id'] && updated_ticket[0]['exhibitor']['os_type']){
											var exhibitor_os = updated_ticket[0]['exhibitor']['os_type'];
											var exhibitor_device =  updated_ticket[0]['exhibitor']['device_id'];
											var To_user = updated_ticket[0]['exhibitor']['id'];
											var From_User = req.body.vendor_id;
											GCMPushNotification(From_User, To_user, exhibitor_device, exhibitor_os, type, message, message1);
										}
										if(updated_ticket[0]['hall_manager_for_ticket'] && updated_ticket[0]['hall_manager_for_ticket']['os_type'] && updated_ticket[0]['hall_manager_for_ticket']['device_id']){
											var ticket_manager_os = updated_ticket[0]['hall_manager_for_ticket']['os_type'];
											var ticket_manager_device =  updated_ticket[0]['hall_manager_for_ticket']['device_id'];
											var To_user = updated_ticket[0]['hall_manager_for_ticket']['id'];
											var From_User = req.body.vendor_id;
											GCMPushNotification(From_User, To_user, ticket_manager_device, ticket_manager_os, type, message, message1);
										}
										
										res.status(200).json({success:true, data:updated_ticket[0]})
									}
								})
							}
							else if(req.body.exhibitor_id && req.body.status){
								if(req.body.status == 'CLOSE'){
									var type = constants.Notification_type.TICKET;
									var message = constants.Notification_message.TICKET_CLOSE;
									Ticket.update({_id:req.body.ticket_id}, {status:req.body.status, message:req.body.message}, {new:true}, function(err, updated_ticket){
										if(err){
											res.status(200).json({success:false, message:err})
										}else{
											if(updated_ticket && updated_ticket.length>0){
												var message1 = updated_ticket[0];
												if(updated_ticket[0]['vendor'] && updated_ticket[0]['vendor']['device_id'] && updated_ticket[0]['vendor']['os_type']){
													var exhibitor_os = updated_ticket[0]['vendor']['os_type'];
													var exhibitor_device =  updated_ticket[0]['vendor']['device_id'];
													var To_user  = updated_ticket[0]['vendor']['id'];
													var From_User = req.body.exhibitor_id
													GCMPushNotification(From_User, To_user, exhibitor_device, exhibitor_os, type, message, message1);
												}
												if(updated_ticket[0]['hall_manager_for_ticket'] && updated_ticket[0]['hall_manager_for_ticket']['os_type'] && updated_ticket[0]['hall_manager_for_ticket']['device_id']){
													var ticket_manager_os = updated_ticket[0]['hall_manager_for_ticket']['os_type'];
													var ticket_manager_device =  updated_ticket[0]['hall_manager_for_ticket']['device_id'];
													var To_user = updated_ticket[0]['hall_manager_for_ticket']['id'];
													var From_User = req.body.exhibitor_id;
													GCMPushNotification(From_User, To_user, ticket_manager_device, ticket_manager_os, type, message, message1);
												}
												res.status(200).json({success:true, data:updated_ticket[0]})
											}else{
												res.status(200).json({success:false, meassage:'Unable to find Ticket'})
											}
										}
									})
									
								}else if(ticket[0]['status'] != 'CLOSE' && req.body.exhibitor_id){
									var type = constants.Notification_type.TICKET;
									var message = constants.Notification_message.TICKET_UPDATE;
									Ticket.update({_id:req.body.ticket_id}, req.body, {new:true}, function(err, updated_ticket){
										if(err){
											res.status(200).json({success:false, message:err})
										}else{
											console.log(updated_ticket)
											var message1 = updated_ticket[0];
											if(updated_ticket[0]['vendor'] && updated_ticket[0]['vendor']['os_type'] && updated_ticket[0]['vendor']['device_id']){
												var exhibitor_os = updated_ticket[0]['vendor']['os_type'];
												var exhibitor_device =  updated_ticket[0]['vendor']['device_id'];
												var To_user = updated_ticket[0]['vendor']['id'];
												var From_User = req.body.exhibitor_id;
												GCMPushNotification(From_User, To_user, exhibitor_device, exhibitor_os, type, message, message1);
											}
											if(updated_ticket[0]['hall_manager_for_ticket'] && updated_ticket[0]['hall_manager_for_ticket']['device_id'] && updated_ticket[0]['hall_manager_for_ticket']['os_type']){
												var ticket_manager_os = updated_ticket[0]['hall_manager_for_ticket']['os_type'];
												var ticket_manager_device =  updated_ticket[0]['hall_manager_for_ticket']['device_id'];
												var To_user = updated_ticket[0]['hall_manager_for_ticket']['id'];
												var From_User = req.body.exhibitor_id;
												GCMPushNotification(From_User, To_user, ticket_manager_device, ticket_manager_os, type, message, message1);
											}
											res.status(200).json({success:true, data:updated_ticket[0]})
										}
									})
								}
							}
							else{
								res.status(200).json({success:false, message:'You cannot update the ticket'})
							}
						}else{
							res.status(200).json({success:false, meassage:'Unable to find Ticket'})
						}
					}
				})
			}else{
				res.status(200).json({
					success: false,
					message: constants.Missing_Parameter
				});
			}
		}
		if (resource == 'ticketcategory') {
			if (req.body.title) {
				TicketCategory.create(req.body, function (err, ticketcategory) {
					if (err) {
						res.status(200).json({
							success: false,
							err: err
						});
					} else {
						console.log(ticketcategory)
						res.status(200).json({
							success: true,
							data: ticketcategory
						});
					}
				})
			} else {
				res.status(200).json({
					success: false,
					message: constants.Missing_Parameter
				});
			}
		}
	}	
	
});




//GET Requests
router.get('/:identifier/:resource', function(req, res){
	var resource = req.params.resource;
	var identifier = req.params.identifier;
	var page_num = parseInt(req.query.page) || 1;
	var offset = parseInt(req.query.offset) || 10;
	if(identifier == 'exhibitor'){
		if(resource == 'exhibitors'){
			if(req.query.Visitor_id){
				Exhibitor.totalRecords(offset, function(err, count){
					if(err){
						res.status(200).json({success:false, message:err});
					}else{
						if(count){
							var fav_exhibitor
							/*Visitor_fav.findwithoutpopulate({Visitor_id:req.query.Visitor_id}, function(err, favs){
								if(err){
									res.status(200).json({success:false, message:err})
								}else{
									if(favs){
										console.log(favs);
										fav_exhibitor = favs[0].Fav_Exhibitors;
										//console.log(fav_exhibitor)
									}else{
										fav_exhibitor = null;
									}
								}
							})*/
							Exhibitor.paginateFind(offset, page_num, function(err, exhibitors){
								if(err){
									res.status(200).json({success:false, message:err})
								}else{
									if(exhibitors){
										//res.status(200).json({success:true, timeslot:constants.ExhibitorTimeSlot, data:exhibitors})
										var exhibitors_updated = IsFav(exhibitors, req.query.Visitor_id);
										res.status(200).json({success:true, timeslot:constants.ExhibitorTimeSlot, data:exhibitors_updated})
									}else{
										res.status(200).json({success:false, message:"Unable to fatch exhibitors"})
									}
								}
							})
						}else{
							res.status(200).json({success:false, message:"Unable to count records"})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'search-exhibitors'){
			if((req.query.PERSON_NAME || req.query.COMPANY_NAME) &&(req.query.Visitor_id)){
				if(req.query.PERSON_NAME){
					var search_query = {PERSON_NAME:{ $regex: req.query.PERSON_NAME, $options:'i' }};
				}if(req.query.COMPANY_NAME){
					var search_query = {COMPANY_NAME: {$regex: req.query.COMPANY_NAME, $options:'i'}};
				}if(req.query.PERSON_NAME && req.query.COMPANY_NAME){
					var search_query = {$or :[{PERSON_NAME:{ $regex: req.query.PERSON_NAME, $options:'i' }}, {COMPANY_NAME: {$regex: req.query.COMPANY_NAME, $options:'i'}}]};
				}
				console.log(search_query);
				Exhibitor.totalRecords(offset, function(err, count){
					if(err){
						res.status(200).json({success:false, message:err});
					}else{
						if(count){
							var fav_exhibitor
							/*Visitor_fav.findwithoutpopulate({Visitor_id:req.query.Visitor_id}, function(err, favs){
								if(err){
									res.status(200).json({success:false, message:err})
								}else{
									if(favs){
										console.log(favs);
										fav_exhibitor = favs[0].Fav_Exhibitors;
										//console.log(fav_exhibitor)
									}else{
										fav_exhibitor = null;
									}
								}
							})*/
							Exhibitor.searchRecords(search_query, offset, page_num, function(err, exhibitors){
								if(err){
									res.status(200).json({success:false, message:err})
								}else{
									if(exhibitors){
										//res.status(200).json({success:true, timeslot:constants.ExhibitorTimeSlot, data:exhibitors})
										var exhibitors_updated = IsFav(exhibitors, req.query.Visitor_id);
										res.status(200).json({success:true, timeslot:constants.ExhibitorTimeSlot, data:exhibitors_updated})
									}else{
										res.status(200).json({success:false, message:"Unable to fatch exhibitors"})
									}
								}
							})
						}else{
							res.status(200).json({success:false, message:"Unable to count records"})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
	}
	if(identifier == 'visitor'){
		if(resource == 'my-favourites'){
			if(req.query.Visitor_id){
				Visitor_fav.find({Visitor_id:req.query.Visitor_id}, function(err, favs){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(favs){
							
							var updated_favs = MyFavIsfav(favs);

							res.status(200).json({success:true, data:updated_favs})
						}else{
							res.status(200).json({success:false, message:'No data found'})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
		if(resource == 'visitors'){
			if(req.query.USER_TYPE){
				Visitor.find({USER_TYPE:req.query.USER_TYPE}, function(err, visitors){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitors){
							res.status(200).json({success:true, data:visitors})
						}
					}
				})
			}
			else if(req.query.User_id){
				Visitor.findOne({_id:req.query.User_id}, function(err, visitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						res.status(200).json({success:true, data:visitor})
					}
				})
			}
			else{
				Visitor.find({}, function(err, visitors){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitors){
							res.status(200).json({success:true, data:visitors})
						}
					}
				})
			}
		}
	}
	if (identifier == 'ticket') {
		if (resource == 'gettickets') {
			if(req.query.date || (req.query.User_id && req.query.User_type)){
				if(req.query.User_type == constants.USER_TYPES.HALL_MANAGER && req.query.User_id){
					if(req.query.date){
						var query =  {$and:[{hall_managers:req.query.User_id},{date:req.query.date}]};
					}else{
						var query =  {hall_managers:req.query.User_id};
					}
				}
				else if(req.query.User_type == constants.USER_TYPES.VENDOR && req.query.User_id){
					if(req.query.date){
						var query =  {$and:[{vendor:req.query.User_id},{date:req.query.date}]};
					}else{
						var query =  {vendor:req.query.User_id};
					}
				}
				else if(req.query.User_type == constants.USER_TYPES.EXHIBITOR && req.query.User_id){
					if(req.query.date){
						var query =  {$and:[{exhibitor:req.query.User_id},{date:req.query.date}]};
					}else{
						var query =  {exhibitor:req.query.User_id};
					}
				}else if(req.body.User_type == constants.USER_TYPES.HALL_DIRECTOR && req.query.User_id){
					if(req.query.date){
						var query =  {$and:[{hall_director:req.query.User_id},{date:req.query.date}]};
					}else{
						var query =  {hall_director:req.query.User_id};
					}
				}
				else{
					var query = {date:req.query.date};
				}
				Ticket.find((query), function (err, tickets) {
					if (err) {
						res.status(200).json({
							success: false,
							message: err
						});
					} else {
						res.status(200).json({
							success: true,
							data: tickets
						});
					}
				})
			}else{
				Ticket.find(({}), function (err, tickets) {
					if (err) {
						res.status(200).json({
							success: false,
							message: err
						});
					} else {
						res.status(200).json({
							success: true,
							data: tickets
						});
					}
				})
			}
		}
	}
	if(resource == 'getticketCategories'){
		TicketCategory.find({}, function(err, categories){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				res.status(200).json({success:true, data:categories})
			}
		})
	}
	if(identifier == 'stall'){
		if(resource == 'stall-names'){
			GetStallsNames(function(err, data){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:data})
				}
			})
		}
		if(resource == 'User-location'){
			if(req.query.lat && req.query.lng){
				Polygons2(function(err, data){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						checkStallWithUser(data, req.query.lat, req.query.lng, function(err, Isinside){
							if(err){
								res.status(200).json({success:false, message:err})
							}else{
								res.status(200).json({success:true, data:Isinside})
							}
						})
					}
				})
			}else{
				res.status(200).json({success:false, message:constants.Missing_Parameter})
			}
		}
		if(resource == 'polygons'){
			Polygons2(function(err, data){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:data})
				}
			})
		}
	}

});




//Put Request 
router.put('/:identifier/:resource', upload.any(), function(req, res){
	var identifier = req.params.identifier;
	var resource =   req.params.resource;
	var ImagesDir = '/images/user_profiles';
	var BrochureDir ='/images/user_profiles';
	var upload_files = req.files;
	console.log(req.files)
	for(var i=0; i<upload_files.length; i++){
		if(upload_files[i]['fieldname'] == 'Profile_pic'){
			req.body.Profile_pic = ImagesDir + upload_files[i]['filename'];
		}
		if(upload_files[i]['fieldname'] == 'Brochure_url'){
			req.body.Brochure_url = BrochureDir + upload_files[i]['filename'];
		}
	}
	if(identifier == 'visitor'){
		if(resource == 'update-profile'){
			if(req.body.User_id){

				Visitor.update({_id:req.body.User_id}, req.body, options, function(err, visitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitor){
							res.status(200).json({success:true, data:visitor})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
	}
	if(identifier == 'exhibitor'){
		if(resource == 'update-profile'){
			if(req.body.User_id){
				Exhibitor.update({_id:req.body.User_id}, req.body, options, function(err, exhibitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(exhibitor){
							res.status(200).json({success:false, data:exhibitor})
						}
					}
				})
			}else{
				res.status(200).json({ success: false, message: constants.Missing_Parameter });
			}
		}
	}
})

                                                      

// POST Request Without Identifier (Common Api Requests)
router.post('/:resource', upload_common.any(), function(req, res){
	var resource = req.params.resource;
	if(resource == 'login'){
		if (req.body.email || req.body.mobile_number) {
			//console.log(req.body.email);
			if(req.body.email){
				$query_visitor = {
					'email' : req.body.email
				};
				$query_exhibitor = {
					'EMAIL' : req.body.email
				};
			}
			else if(req.body.mobile_number){
				$query_visitor = {
					'mobile_number' : req.body.mobile_number
				};
				$query_exhibitor = {
					'MOBILE' : req.body.mobile_number
				}
			}
    		Visitor.findOne($query_visitor, function(err, visitor) {
       			if (err) {
            		res.status(200).json({ success: false, message: err });
        		} else{
        			if (visitor) {
            			/*if (comparePassword(req.body.password, visitor.password)) {
                			res.status(200).json({ success: true, data: visitor });
            			} else {
                			res.status(200).json({ success: false, message: constants.Password_Mismatch });
           				}*/
           				//console.log(visitor)
           				var OTP = OTP_genrate();
           				if(OTP){
           					if(req.body.device){
		               			var device = req.body.device;
		               		}else{
		               			var device = '';
		               		}
		               		if(req.body.os_type){
		               			var os_type = req.body.os_type;
		               		}else{
		               			var os_type = '';
		               		}
		               		if(req.body.device_id){
		               			var device_id = req.body.device_id;
		               		}else{
		               			var device_id = '';
		               		}
           					Visitor.update({_id:visitor.id}, {OTP:OTP, Is_Verified:false, device:device, os_type:os_type, device_id:device_id}, {new:true}, function(err, visitor_update){
           						if(err){
           							res.status(200).json({success:false, message:err})
           						}else{
           							if(visitor_update){
           								console.log(visitor_update)
           								var otp_sms = 'Your One time password for Elecrama Login is : '+visitor_update.OTP;
			           					var reciever_email = visitor_update.email;
			           					var receiver_no = visitor_update.mobile_number;
			           					EMAILOTP(otp_sms, reciever_email);
			           					SMSOTP(otp_sms, receiver_no);
           								res.status(200).json({success:true, message:"OTP has been sent successfully !", USER_ID:visitor_update.id, USER_TYPE:visitor_update.USER_TYPE})
           							}
           						}
           					})
           				}else{

           				}
        			}else{
        				Exhibitor.findOne($query_exhibitor, function(err, exhibitor){
        					if(err){
        						res.status(200).json({success:false, message:err})
        					}else{
        						if(exhibitor){
        							console.log(exhibitor)
		               				var OTP = OTP_genrate();
		               				if(OTP){
		               					if(req.body.device){
		               						var device = req.body.device;
		               					}else{
		               						var device = '';
		               					}
		               					if(req.body.os_type){
		               						var os_type = req.body.os_type;
		               					}else{
		               						var os_type = '';
		               					}
		               					if(req.body.device_id){
		               						var device_id = req.body.device_id;
		               					}else{
		               						var device_id = '';
		               					}
		               					Exhibitor.update({_id:exhibitor.id}, {OTP:OTP, Is_Verified:false, device:device, os_type:os_type, device_id:device_id}, {new:true}, function(err, exhibitor_update){
		               						if(err){
		               							res.status(200).json({success:false, message:err})
		               						}else{
		               							if(exhibitor_update){
		               								//console.log(exhibitor_update)
		               								var otp_sms = 'Your One time password for Elecrama Login is : '+exhibitor_update.OTP;
			           								var reciever_email = exhibitor_update.EMAIL;
			           								var receiver_no = exhibitor_update.MOBILE;
			           								EMAILOTP(otp_sms, reciever_email);
			           								SMSOTP(otp_sms, receiver_no);
		               								res.status(200).json({success:true, message:"OTP has been sent successfully !", USER_ID:exhibitor_update.id, USER_TYPE:'EXHIBITOR'})
		             
		               							}
		               						}
		               					})
		               				}else{

		               				}
        						}else{
        							res.status(200).json({ success: false, message: constants.EmailID_NotRegistered})
        						}
        					}
        				})
        			}
        		}
    		});
		}else{
    		res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'verify-otp'){
		if(req.body.User_id && req.body.OTP && req.body.User_type){
			if(req.body.User_type == 'EXHIBITOR'){
				Exhibitor.findOne({_id:req.body.User_id}, function(err, exhibitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(exhibitor){
							console.log(exhibitor)
							if(req.body.OTP == exhibitor.OTP){
								Exhibitor.update({_id:req.body.User_id}, {Is_Verified:true}, {new:true}, function(err, exhibitor_update){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(exhibitor_update){
											res.status(200).json({success:true, data:exhibitor_update})
										}else{
											console.log("Unable to Update Visitor in DB")
										}
									}
								})
							}else{
								res.status(200).json({success:false, message:"OTP Mismatch"})
							}
						}
					}
				})
			}else{
				Visitor.findOne({_id:req.body.User_id}, function(err, visitor){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(visitor){
							console.log(visitor)
							if(req.body.OTP == visitor.OTP){
								Visitor.update({_id:req.body.User_id}, {Is_Verified:true}, {new:true}, function(err, visitor_update){
									if(err){
										res.status(200).json({success:false, message:err})
									}else{
										if(visitor_update){
											res.status(200).json({success:true, data:visitor_update})
										}else{
											console.log("Unable to Update Visitor in DB")
										}
									}
								})
							}else{
								res.status(200).json({success:false, message:"OTP Mismatch"})
							}
						}
					}
				})
			}
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'resend-otp'){
		if(req.body.User_id && req.body.User_type){
			if(req.body.User_type == 'EXHIBITOR'){
				var OTP = OTP_genrate();
				//Generate OTP for Exhibitor
				Exhibitor.findOne({_id:req.body.User_id}, function(err, user){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						console.log(user)
						if(user){
							Exhibitor.update({_id:user.id}, {OTP:OTP, Is_Verified:false}, {new:true}, function(err, exhibitor){
           						if(err){
           							res.status(200).json({success:false, message:err})
           						}else{
           							if(exhibitor){
           								console.log(exhibitor)
           								var otp_sms = 'Your One time password for Elecrama Login is : '+exhibitor.OTP;
           								var reciever_email = exhibitor.EMAIL;
           								var receiver_no = exhibitor.MOBILE;
           								EMAILOTP(otp_sms, reciever_email);
           								SMSOTP(otp_sms, receiver_no);
           								res.status(200).json({success:true, message:"OTP has been sent successfully !", USER_ID:exhibitor.id, USER_TYPE:'EXHIBITOR'})
           							}
           						}
           					})
						}
					}
				})
			}else{
				//Generate OTP for Visitor
				var OTP = OTP_genrate();
				//Generate OTP for Exhibitor
				Visitor.findOne({_id:req.body.User_id}, function(err, user){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(user){
							Visitor.update({_id:user.id}, {OTP:OTP, Is_Verified:false}, {new:true}, function(err, visitor){
           						if(err){
           							res.status(200).json({success:false, message:err})
           						}else{
           							if(visitor){
           								console.log(visitor)
           								var otp_sms = 'Your One time password for Elecrama Login is : '+visitor.OTP;
           								var reciever_email = visitor.email;
           								var receiver_no = visitor.mobile_number;
           								EMAILOTP(otp_sms, reciever_email);
           								SMSOTP(otp_sms, receiver_no);
           								res.status(200).json({success:true, message:"OTP has been sent successfully !", USER_ID:visitor.id, USER_TYPE:visitor.USER_TYPE})
           							}
           						}
           					})
						}
					}
				})
			}
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'appointment'){
		if(req.body.Exhibitor_id && req.body.Visitor_id && req.body.Appointment_date && req.body.Timeslot){
			Appointment.create(req.body, function(err, appointment){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(appointment){
						var device_id =  appointment.Exhibitor_id.device_id;
						var os_type = appointment.Exhibitor_id.os_type;
						var type = constants.Notification_type.APPOINTMENT;
						var message = 'New Appointment';
						var message1 = appointment;
						var To_user = req.body.Exhibitor_id;
						var From_User = req.body.Visitor_id;
						GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
						res.status(201).json({success:true, data:appointment})
					}else{
						res.status(200).json({success:false, message:constants.unableToCreateAppointment})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'key-location'){
		if(req.body.Title && req.body.Contact_PersonName && req.body.Contact_PersonMobile && req.body.Address && req.body.Lat && req.body.Lng && req.body.Type){
			Keylocation.create(req.body, function(err, keylocation){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(keylocation){
						res.status(201).json({success:true, data:keylocation})
					}else{
						res.status(200).json({success:false, message:'Unable to create Key Location'})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'emergency-contact'){
		if(req.body.Title && req.body.Contact_number){
			EmergencyContacts.create(req.body, function(err, contact){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(contact){
						res.status(200).json({success:true, data:contact})
					}else{
						res.status(200).json({success:false, message:'Unable to create emergency contact'})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'appointment-timeslot'){
		if(req.body.Start_time && req.body.End_time && req.body.duration){
			AppointmentTimeSlots.create(req.body, function(err,slot){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(slot){
						res.status(200).json({success:true, data:slot})
					}else{
						res.status(200).json({success:false, message:'Unable to create Appointment Time Slot'})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'elecarama-tv'){
		console.log(req.body);
		if(req.body.Title && req.body.Description && req.body.Showcase_date && req.body.Showcase_time && req.body.Youtube_video_id && req.body.Thumbnail_url){
			ElecaramaTv.create(req.body, function(err, elecaramaTv){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(elecaramaTv){
						res.status(201).json({success:true, data:elecaramaTv})
					}else{
						res.status(200).json({success:false, message:"unable to create new live feed"})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'add-contact'){
		if(req.body.access_token && req.body.User_id && req.body.User_type){
			//QR code scanned User
			var decoded_data = verifyToken(req.body.access_token);
			var create_contact;
			if(decoded_data){
				console.log(decoded_data)
				if(decoded_data.USER_TYPE == 'EXHIBITOR'){
					Exhibitor.find({$and:[{EMAIL:decoded_data.Email}, {MOBILE:decoded_data.mobile_number}]}, function(err, Exhibitor){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							if(Exhibitor){
								var reqUser_id = req.body.User_id;
								var Exist;
								User_Exist(reqUser_id, Exhibitor[0].id, 'EXHIBITOR', function(data){
									Exist = data;
									if(Exist == true){
										res.status(200).json({success:false, message:"User Already Exist in Your Contact List"})
									}else{
										create_contact = {
											Scaned_USER:{
												kind:'Exhibitor',
												item : Exhibitor[0].id
											},
											User_id : req.body.User_id,
											User_type : req.body.User_type,
											Scaned_userType: decoded_data.USER_TYPE,
											Scaned_Exhibitor: Exhibitor[0].id
										};
										Contact.create(create_contact, function(err, contact){
											if(err){
												res.status(200).json({success:false, message:err})
											}else{
												if(contact){
													res.status(201).json({success:true, data:contact})
												}
											}
										})
									}
								});
							}else{

							}
						}
					})
					
				}else{
					Visitor.find({$and :[{email:decoded_data.Email}, {mobile_number:decoded_data.mobile_number}]}, function(err, visitor){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							if(visitor){
								var reqUser_id = req.body.User_id;
								
								console.log(visitor);
								var visitor_id = visitor[0].id;
								var Exist;
								User_Exist(reqUser_id, visitor_id, 'VISITOR', function(data){
									Exist = data;
									if(Exist == true){
										res.status(200).json({success:false, message:"User Already Exist in Your Contact List"})
									}else{
										create_contact= {
											Scaned_USER:{
												kind:'Visitor',
												item : visitor[0].id
											},
											User_id : req.body.User_id,
											User_type : req.body.User_type,
											Scaned_userType : decoded_data.USER_TYPE,
											Scaned_Visitor: visitor[0].id
										};
										console.log(create_contact)
										Contact.create(create_contact, function(err, contact){
											if(err){
												res.status(200).json({success:false, message:err})
											}else{
												if(contact){
													res.status(201).json({success:true, data:contact})
												}
											}
										})
									}
								});
							}
						}
					})
				}
			}

		}
		else if(req.body.User_id && req.body.User_type && req.body.Friends){
			//Facebook Login
			AddFacebookFriends(req.body.User_id, req.body.User_type, req.body.Friends, function(err, response){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:response})
				}
			})
		}else {
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
	if(resource =='send-notification'){
		if(req.body.device_token){
			GCMPushNotification(req.body.device_token, function(err, response){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(response){
						res.status(200).json({success:true, data:response})
					}
				}
			})
		}else{
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
	if(resource =='send-sms'){
		if(req.body.User_no){
			var otp_sms = "Your One time password for Elecrama login is 6765";
			var sender_id = 'Elecrama';
			var reciever =req.body.User_no;
			SMSOTP(otp_sms, reciever);
			res.status(200).json({success:true, message:'Otp sent'})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'register-hall'){
		if(req.body.Hall_title){
			Hall.create(req.body, function(err, hall){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:hall})
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'update-hall'){
		var options ={
			new:true
		};
		if(req.body.Hall_id){
			Hall.update({_id:req.body.Hall_id}, req.body, options, function(err, hall){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:hall})
				}
			}); 
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'about-us'){
		if(req.body.Title){
			if(req.files){
				console.log(req.files)
				for(var i=0; i<req.files.length; i++){
					if(req.files[i]['fieldname'] == 'Banner_image'){
						var base_folder = '/images/';
						req.body.Banner_image = base_folder+''+req.files[i]['filename'];
					}
				}
			}
			AboutUS.create(req.body, function(err, about){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:about})
				}
			})
		}else{
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
	if(resource == 'update-aboutus'){
		if(req.body.about_id){
			if(req.files){
				for(var i=0; i<req.files.length; i++){
					if(req.files[i]['fieldname'] == 'Banner_image'){
						var base_folder = '/images/';
						req.body.Banner_image = base_folder+''+req.files[i]['filename'];
					}
				}
			}
			AboutUS.update({_id:req.body.about_id}, req.body, {new:true}, function(err, about){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:about})
				}
			})
		}else{
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
	if(resource == 'social-links'){
		if(req.body.Title){
			Social.create(req.body, function(err, social){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:social})
				}
			})
		}else{
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
	if(resource == 'update-sociallinks'){
		if(req.body.social_id){
			Social.update({_id:req.body.social_id}, req.body, {new:true}, function(err, social){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(social){
						res.status(200).json({success:true, data:social})
					}else{
						res.status(200).json({success:false, message:"No records found !"})
					}
				}
			})
		}else{
			res.status(200).json({success:true, message:constants.Missing_Parameter})
		}
	}
	if(resource == 'delete-social'){
		if(req.body.social_id){
			Social.destroy(req.body.social_id, function(err, data){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:data})
				}
			})
		}
	}
});




//Get Request Without Identifier
router.get('/:resource', function(req, res){
	var page_num = parseInt(req.query.page) || 1;
	var offset = parseInt(req.query.offset) || 10;
	var resource = req.params.resource;
	if(resource == 'my-appointments'){
		if(req.query.User_id && req.query.User_type){
			console.log(req.query)
			if(req.query.User_type == 'EXHIBITOR'){
				if(req.query.Appointment_date){
					Appointment.find({Exhibitor_id : req.query.User_id, Appointment_date : req.query.Appointment_date}, function(err, appointments){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							if(appointments){
								res.status(200).json({success:true, data:appointments})
							}else{
								res.status(200).json({success:false, message:constants.NoAppointmentsFound})
							}
						}
					})
				}else{
					Appointment.find({Exhibitor_id : req.query.User_id}, function(err, appointments){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							if(appointments){
								res.status(200).json({success:true, data:appointments})
							}else{
								res.status(200).json({success:false, message:constants.NoAppointmentsFound})
							}
						}
					})
				}
			}
			else if(req.query.User_type == 'VISITOR'){
				if(req.query.Appointment_date){
					Appointment.find({Visitor_id : req.query.User_id, Appointment_date : req.query.Appointment_date}, function(err, appointments){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							
							if(appointments){
								res.status(200).json({success:true, data:appointments})
							}else{
								res.status(200).json({success:false, message:constants.NoAppointmentsFound})
							}
						}
					})
				}else{
					Appointment.find({Visitor_id : req.query.User_id}, function(err, appointments){
						if(err){
							res.status(200).json({success:false, message:err})
						}else{
							
							if(appointments){
								console.log(appointments);
								res.status(200).json({success:true, data:appointments})
							}else{
								res.status(200).json({success:false, message:constants.NoAppointmentsFound})
							}
						}
					})
				}
			}else{
				res.status(200).json({success:false, message:constants.NoAppointmentsFound})
			}

		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'key-locations'){
		Keylocation.find({}, function(err, locations){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				if(locations){
					res.status(200).json({success:true, data:locations})
				}else{
					res.status(200).json({success:false, message:'Unable to find Key Locations'})
				}
			}
		})
	}
	if (resource == 'getkeylocation') {
		if (req.query.location_id) {
			Keylocation.find({
				"_id": req.query.location_id
			}, function (err, keylocation) {
				if (err) {
					res.status(200).json({
						success: false,
						message: err
					})
				} else {
					res.status(200).json({
						success: true,
						message: keylocation
					})
				}
			})
		} else {
			Keylocation.find(({}), function (err, keylocation) {
				if (err) {
					res.status(200).json({
						success: false,
						message: err
					})
				} else {
					res.status(200).json({
						success: true,
						data: keylocation
					})
				}
			})
		}
	}
	if(resource == 'emergency-contacts'){
		//res.status(200).json({success:true, data:constants.EmergencyContacts});
		EmergencyContacts.find({}, function(err, contacts){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				if(contacts){
					res.status(200).json({success:true, data:contacts})
				}else{
					res.status(200).json({success:false, message:"Unable to find the emergency contacts"})
				}
			}
		})
	}
	if(resource == 'appointment-timeslots'){
		AppointmentTimeSlots.find({}, function(err, slots){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				if(slots){
					res.status(200).json({success:true, data:slots})
				}else{
					res.status(200).json({success:false, message:'Unable to find Appointment timeSlots'})
				}
			}
		})
	}
	if(resource == 'elecarama-tv'){
		if(req.query.Showcase_date){
			ElecaramaTv.find({Showcase_date:req.query.Showcase_date}, function(err, elecaramaTv){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(elecaramaTv){
						res.status(200).json({success:true, data:elecaramaTv})
					}else{
						res.status(200).json({success:false, message:'Unable to find videos'})
					}
				}
			})
		}else{
			ElecaramaTv.find({}, function(err, elecaramaTv){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(elecaramaTv){
						res.status(200).json({success:true, data:elecaramaTv})
					}else{
						res.status(200).json({success:false, message:'Unable to find videos'})
					}
				}
			})
		}
	}
	if(resource == 'contacts'){
		if(req.query.User_id){
			Contact.find({User_id : req.query.User_id}, function(err, contacts){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(contacts){
						res.status(200).json({success:true, data:contacts})
					}
				}
			})
		}
	}
	if(resource == 'halls'){
		if(req.query.Hall_id){
			Hall.find({_id:req.query.Hall_id}, function(err, hall){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:hall})
				}
			})
		}else{
			Hall.find({}, function(err, halls){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:halls})
				}
			})
		}
	}
	if(resource == 'about-us'){
		AboutUS.find({}, function(err, about){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				Social.find({}, function(err, social_links){
					if(err){
						res.status(200).json({success:false, message:err})
					}
					var data ={
						About_us:about,
						Social_links: social_links
					};
					res.status(200).json({success:true, data:data})
				})
				
			}
		})
	}
	if(resource =='social-links'){
		Social.find({}, function(err, social_links){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				res.status(200).json({success:true, data:social_links})
			}
		})
	}
	if(resource == 'total-records'){
		get_counts(function(err, records){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				res.status(200).json({success:true, data:records})
			}
		})
	}
	if(resource == 'user-notifications'){
		if(req.query.User_id){
			UserNoticiation.paginateFind({To_userId:req.query.User_id}, offset, page_num, function(err, notifications){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					res.status(200).json({success:true, data:notifications})
				}
			})
		}else{
			res.status(200).json({success:false, message:constants.Missing_Parameter})
		}
	}
})




//Put Request without Identifier
router.put('/:resource', function(req, res){
	var options={ new:true };
	var resource = req.params.resource;
	if(resource == 'appointment'){
		if(req.body.Appointment_id && req.body.Status && req.body.User_type){
			if(req.body.User_type == 'VISITOR' && req.body.Status != 'CANCELLED'){
				res.status(200).json({success:false, message:"You are not allowed to update the status"})
			}else{
				Appointment.find({_id:req.body.Appointment_id}, function(err, appointment){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(appointment){
							var status = appointment[0].Status;
							console.log("Status" + status)
							if(req.body.User_type == 'EXHIBITOR'){
								if(status == 'REJECTED' || status == 'CANCELLED' || status == 'FINISHED'){
									res.status(200).json({success:false, message:'You are not allowed to update the status'})
								}else{
									if(req.body.Status && status=='PENDING'){
										Appointment.update({_id:req.body.Appointment_id}, {Status: req.body.Status}, options, function(err, appointment){
											if(err){
												res.status(200).json({success:false, message:err})
											}else{
												if(appointment){
													console.log(appointment)
													var device_id =  appointment[0].Visitor_id.device_id;
													var os_type = appointment[0].Visitor_id.os_type;
													var type = constants.Notification_type.APPOINTMENT;
													var message = 'Appointment ' +req.body.Status+' by Exhibitor';
													var message1 = appointment;
													console.log(device_id)
													var To_user = appointment[0].Visitor_id['id'];
													var From_User = appointment[0].Exhibitor_id['id'];
													GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
													res.status(200).json({success:true, data:appointment})
												}else{
													res.status(200).json({success:false, message:constants.UnableToUpdateStatus})
												}
											}
										})
									}else{
										if(req.body.Status =='FINISHED' && status =='APPROVED'){
											Appointment.update({_id:req.body.Appointment_id}, {Status: req.body.Status}, options, function(err, appointment){
											if(err){
												res.status(200).json({success:false, message:err})
											}else{
												if(appointment){
													console.log(appointment)
													var device_id =  appointment[0].Visitor_id.device_id;
													var os_type = appointment[0].Visitor_id.os_type;
													var type = constants.Notification_type.APPOINTMENT;
													var message = 'Appointment ' +req.body.Status+' by Exhibitor';
													var message1 = appointment;
													var To_user = appointment[0].Visitor_id['id'];
													var From_User = appointment[0].Exhibitor_id['id'];
													console.log(device_id)
													GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
													res.status(200).json({success:true, data:appointment})
												}else{
													res.status(200).json({success:false, message:constants.UnableToUpdateStatus})
												}
											}
										})
										}else{
											res.status(200).json({success:false, message:'Already '+status})
										}
									}
								}
							}else{
								if(req.body.Status == 'CANCELLED' && status == 'PENDING'){
									Appointment.update({_id:req.body.Appointment_id}, {Status: req.body.Status}, options, function(err, appointment){
										if(err){
											res.status(200).json({success:false, message:err})
										}else{
											if(appointment){
												var device_id =  appointment[0].Exhibitor_id.device_id;
												var os_type = appointment[0].Exhibitor_id.os_type;
												var type = constants.Notification_type.APPOINTMENT;
												var message = 'Appointment cancelled by Visitor';
												var message1 = appointment;
												var From_User = appointment[0].Visitor_id['id'];
												var To_user = appointment[0].Exhibitor_id['id'];
												GCMPushNotification(From_User, To_user, device_id, os_type, type, message, message1);
												res.status(200).json({success:true, data:appointment})
											}else{
												res.status(200).json({success:false, message:constants.UnableToUpdateStatus})
											}
										}
									})
								}else{
									res.status(200).json({success:false, message:"You are not allowed to update the status"})
								}
							}
						}
					}
				})
				/*
				Appointment.update({_id:req.body.Appointment_id}, {Status: req.body.Status}, options, function(err, appointment){
					if(err){
						res.status(200).json({success:false, message:err})
					}else{
						if(appointment){
							res.status(200).json({success:true, data:appointment})
						}else{
							res.status(200).json({success:false, message:constants.UnableToUpdateStatus})
						}
					}
				})*/
			}
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'emergency-contact'){
		if(req.body.Contact_id){
			EmergencyContacts.update({_id:req.body.Contact_id}, req.body, options, function(err, contact){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(contact){
						res.status(200).json({success:true, data:contact})
					}else{
						res.status(200).json({success:false, message:"Unable to Update Contact Number"})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'appointment-timeslot'){
		if(req.body.Timeslot_id){
			AppointmentTimeSlots.update({_id:req.body.Timeslot_id}, req.body, options, function(err, slot){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(slot){
						res.status(200).json({success:true, data:slot})
					}else{
						res.status(200).json({success:false, message:"Unable to update Appointment Time Slot"})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
	if(resource == 'elecarama-tv'){
		if(req.body.ElecaramaTv_id){
			ElecaramaTv.update({_id:req.body.ElecaramaTv_id}, req.body, options, function(err, elecaramaTv){
				if(err){
					res.status(200).json({success:false, message:err})
				}else{
					if(slot){
						res.status(200).json({success:true, data:elecaramaTv})
					}else{
						res.status(200).json({success:false, message:"Unable to update Elecarama Video"})
					}
				}
			})
		}else{
			res.status(200).json({ success: false, message: constants.Missing_Parameter });
		}
	}
})


//Helper Functions 
var createhash = function(password) {
	var salt  = saltgen();
	console.log('salt is : ');
	console.log(salt);
    return bcrypt.hashSync(password, salt, null)
}
var comparePassword = function(password, bpassword) {
    if (bcrypt.compareSync(password, bpassword)) {
        return true;
    } else {
        return false;
    }

}
var saltgen = function(){
	bcrypt.genSalt(10, function(error, salt) {
		if(error){
			return next(error);
		}else{
			return salt;
		}
	});
}

function excelToJson(){
	var workbook = XLSX.readFile('el.xls');
			var sheet_name_list = workbook.SheetNames;
			var data = [];
			sheet_name_list.forEach(function(y) {
	    		var worksheet = workbook.Sheets[y];
				var headers = {};
				//var data = [];
				for(z in worksheet) {
				     if(z[0] === '!') continue;
				     //parse out the column, row, and value
				     var tt = 0;
				     for (var i = 0; i < z.length; i++) {
				        if (!isNaN(z[i])) {
				            tt = i;
				            break;
				        }
				    };
				    var col = z.substring(0,tt);
				    var row = parseInt(z.substring(tt));
				    var value = worksheet[z].v;
			        //store header names
			        if(row == 1 && value) {
			            headers[col] = value;
			            continue;
			        }
			        if(!data[row]) data[row]={};
			        data[row][headers[col]] = value;
			       // console.log(data)
			    }
			    //drop those first two rows which are empty
			    //data.shift();
			    //data.shift();
			    //console.log("total_data: "+data.length)
			    
			});
			return data;
}


//To check fav
function IsFav(exhibitors, Visitor_id){
	for(var i=0; i<exhibitors.length; i++){
		//console.log(exhibitors[i]['fav_vistors'].length);
		if(!exhibitors[i]['fav_vistors']){
			exhibitors[i].Isfav = 'false';
		}else{
			if(exhibitors[i]['fav_vistors'].length==0){
				exhibitors[i].Isfav = 'false';
			}else{
				for(var j=0; j<exhibitors[i]['fav_vistors'].length; j++){
					if(exhibitors[i]['fav_vistors'][j] == Visitor_id){
						exhibitors[i].Isfav = 'true';
						//console.log('true');
					}else{
						exhibitors[i].Isfav = 'false';
						//console.log(exhibitors[i]);
						//console.log('false');
					}
				}
			}
		}
	}
	console.log(exhibitors)
	return exhibitors;
}

function MyFavIsfav(favs){
	var favs_length = favs[0]['Fav_Exhibitors'].length;
	console.log(favs_length)
	for(var i=0; i<favs_length; i++){
		favs[0]['Fav_Exhibitors'][i].Isfav = 'true';
	}
	console.log(favs);
	return favs;
}

function OTP_genrate(){
	var min = Math.ceil(constants.OTP_LENGTH.min);
  	var max = Math.floor(constants.OTP_LENGTH.max);
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Openfire_GID(username, password){
	var openfire_user = username;
	var openfire_pass = password;
	var openfire_base = constants.OPENFIRE_BASEGID;
	var options = {
  		url: constants.OPENFIRE_CREATEUSER,
  		form: {
  			username: openfire_user,
  			password: openfire_pass
  		},
  		headers: {
    		'Authorization': 'Basic rs79RLqG0i38c7bt',
    		'Content-Type' : 'application/json'
 		}
	};
	request.post(options, function(err, httpResponse, body){
		if(err){
			throw err;
			console.log(err);

		}else{
			 var response_code = httpResponse && httpResponse.statusCode;
			 if(response_code == 200 || response_code == 201){
			 	return openfire_user+'@'+OPENFIRE_BASEGID;
			 }else{
			 	return '';
			 }
		}
	})
}

function verifyToken(access_token) {
	var data;
  // check header or url parameters or post parameters for token
  var token = access_token;
  var secret = keys.JWTSecretKey;
  console.log('secret: '+secret);
  // decode token
    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {      
      if (err) {
      	data=err;
       
      } else {
        data= decoded;
      }
    });
    return data;
}

function User_Exist(user_id, Scanned_id, scanned_usertype,callback){
	var data;

	if(scanned_usertype == 'EXHIBITOR'){
		Contact.find({$and:[{User_id: user_id}, {Scaned_Exhibitor:Scanned_id}]}, function(err, user){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				console.log("Length:"+user.length)
				if(user && user.length > 0){
				data= true;
				}else{
				data= false;
				}
			}
			callback(data);
		})
	}else{
		Contact.find({$and :[{User_id: user_id}, {Scaned_Visitor: Scanned_id}]}, function(err, user){
			if(err){
				res.status(200).json({success:false, message:err})
			}else{
				console.log("Length:"+user.length)
				if(user && user.length >0){
				data= true;
				}else{
				data= false;
				}
			}
			callback(data)
		})
	}
	
}

function GCMPushNotification(From_User, To_user, registeration_token, os_type, notification_type, notification_message, notification_data){
	if(os_type = 'ANDROID'){
		var registeration_token1 = [registeration_token];
		var message = new gcm.Message({
	    	data: { 
	    			type: notification_type,
	    			message : notification_message,
	    			message1 : notification_data
	    			
	    		}
		});
		GCMsender.send(message, { registrationTokens: registeration_token1 }, function (err, response) {
		    if (err){
		    	console.log(err);
		    	return;
		    } 
		    else{
		    	console.log(response)
		    	var UserNoticiation_data = {
		    		To_userId:To_user,
		    		From_userId:From_User,
		    		Message:notification_message,
		    		Message1:JSON.stringify(notification_data),
		    		Type:notification_type
		    	};
		    	UserNoticiation.create(UserNoticiation_data, function(err, notification){
		    		if(err){
		    			console.log(err);
		    			return;
		    		}else{
		    			console.log('notification send and stored successfully')
		    		}
		    	})
		    }
		});
	}
}

function SMSOTP(otp_sms, receiver_no){
	var options = {
  		url: constants.SmsGateWayBaseUrl,
  		form: {
  			method: 'sms',
  			sender: 'ELCRMA',
  			to : receiver_no,
  			message : otp_sms
  		}
	};
	request.post(options, function(err, httpResponse, body){
		if(err){
			console.log(err);
			return;
		}else{
			 var response_code = httpResponse && httpResponse.statusCode;
			 console.log("Response " +JSON.stringify(httpResponse))
		}
	})

}

function EMAILOTP(otp_sms, reciever_email){
	var mailOptions = {
		from: 'nodetesterexp@gmail.com', // sender address
		to: reciever_email, // list of receivers
		subject: 'One Time Password :- Elecrama 2018', // Subject line
		html: otp_sms
	};
    transporter.sendMail(mailOptions, function(err, info){
		if(err){
			console.log(err);
			return;
			next();
		}else{
		    console.log('Message sent: ' + info.response);
		};
	});
}

function QRCodeGenerate_Exhibitor(exhibitors, callback){
	for(var i=0; i<exhibitors.length; i++){

	}
}

function GetStallsNames(callback){
	Stall.distinctRecords({}, 'stall_name', function(err, stallnames){
		if(err){
			callback(err, null)
		}else{
			callback(null, stallnames)
		}
	})
}
function finduserLocationStall(lat, lng, callback){
	
}
var Polygons2 = function(callback) {
	var polygon={};
	var corners=[];
	var corner2 = [];
	var stall_name;
    Stall.distinctRecords({}, 'stall_name', function(err, stallnames){
        async.forEachOf(stallnames, function(stall, index_i, callback) 
        {
        	
            Stall.find({"stall_name" : stall}, function(err, corners)
            {
                async.forEachOf(corners,  function(corner, index_j, callback) 
                {
                	//console.log(index_i)
                	//console.log("Second "+index_j)
                  	//Pending Array
               		
               		corner2.push({
               			latitude:parseFloat(corner.lat),
               			longitude:parseFloat(corner.lng)
               		})
               		stall_name = corner.stall_name;
               		callback();
                }, function(err) {
                    // All contacts are processed
                    corner2.sort(function(a, b){return a.longitude - b.longitude})
                    polygon[stall_name] = corner2;
                    corner2=[];
                    callback();

                });
            });
        }, function(err) {
            // All users are processed
            // Here the finished result
          
            callback(null, polygon);
        });
    });
};
var AddFacebookFriends = function(User_id, User_type, Friends, callback){
	//for(var i=0; i<req.body.Friends.length; i++){
	
	async.forEachOf(Friends, function(friend, callback_inner){
		var create_data = {
			Friend :friend,
			User_id:User_id,
			User_type:User_type,
			Scaned_userType:'FACEBOOK'
		}
		var find_user = User_id;
		console.log("User_id : "+find_user)
		console.log("friend_id: "+friend['id'])
		Contact.find({$and:[{'Friend.id':friend['id']},{User_id:find_user}]}, function(err, user){
			if(err){
				callback(err, null)
			}else{
				console.log(user)
				if(user && user.length>0){

				}else{
					Contact.create(create_data, function(err, friend_new){
						if(err){
							console.log(err)
							callback(err, null)
						}else{
							console.log("After:" +JSON.stringify(friend_new))
							
						}
					})
				}
			}
		})
	}, function(err){
		callback_inner();
	})
	callback(null, 'Friend Added Succesfully')
};
var checkStallWithUser = function(User_id, polygons, lat, lng, callback){
	console.log('data')
	var stall;
	var stall_loc = false;
	var stall_name = '';
	for (stall in polygons) {
    	var poly_param = polygons[stall];
    	var data = geolib.isPointInside(
    		{latitude: parseFloat(lat), longitude: parseFloat(lng)},
   			 poly_param
   		);
		console.log(data)
		if(data == true){
			stall_loc= true;
			stall_name = stall;
			break;
		}
	}
	if(stall_loc==false){
		console.log('User not at stalls')
		callback(null, false);
	}else{
		var d = new Date();
		var day = d.getDate();
		var month = d.getMonth()+1;
		var year = d.getFullYear();
		var current_date = day+"/"+month+"/"+year;
		console.log(current_date);
		var response ={
			UserAtStall: stall_loc,
			Stall:stall_name
		}
		//Insert 
		StallVisitor.findOne({$and:[{Visitor_id:User_id}, {Stall:stall_name}, {Date: current_date}]}, function(err, data){
			if(err){
				callback(err, null)
			}else{
				if(data && data.length >0){
					console.log('User Already visited');
					callback(null, false)
				}else{
					StallVisitor.create({Stall:stall_name, Visitor_id:User_id, Date:current_date}, function(err, response){
						if(err){
							callback(err, null)
						}else{
							callback(null ,response)
						}
					})
				}
			}
		})
	}
};
function polygons(callback){
	Stall.distinctRecords({}, 'stall_name', function(err, stallnames){
		if(err){
			callback(err, null)
		}else{
			var counter =0;
			for(var i=0; i<stallnames.length; i++){
				Stall.find({"stall_name" : stallnames[i]}, function(err, stall){
					if(err){
						callback(err, null)
					}else{
						var polygons;
						if(stall){
							console.log(stall)
							console.log
							for(var j=0; j<stall.length; j++){
								polygons = [{index:j[{
									lat: stall[j]['lat'],
									lng: stall[j]['lng']
								}]}]
							}
						}
					}
					if(counter == stallnames.length -1){
						callback('amit', null)
					}
						
				})
				counter++;
			}
		}
	})
}
function get_counts(callback){
	var records;
	Visitor.totalDocuments({'USER_TYPE' : 'VISITOR'}, function(err, visitors){
		if(err){
			callback(err, null)
		}else{
			Exhibitor.totalDocuments({}, function(err, exhibitors){
				if(err){
					callback(err, null)
				}else{
					Ticket.totalDocuments({}, function(err, tickets){
						if(err){
							callback(err, null)
						}else{
							Ticket.totalDocuments({status:'OPEN'}, function(err, open_tickets){
								if(err){
									callback(err, null)
								}else{
									Appointment.totalDocuments({}, function(err, appointments){
										if(err){
											callback(err, null)
										}else{
											Appointment.RecentRecords({Status:'PENDING'}, 10, function(err, pending_appointments){
												if(err){
													callback(err, null)
												}else{
													Ticket.RecentRecords({status:'OPEN'}, 10, function(err, open_ticket_details){
														if(err){
															callback(err, null)
														}else{
															records = {
																Visitors : visitors,
																Exhibitors : exhibitors,
																Total_Tickets:tickets,
																Open_Tickets: open_tickets,
																Appointments : appointments,
																Recent_Pending_Appointments: pending_appointments,
																Recent_Open_Tickets: open_ticket_details
															}
															callback(null, records)
														}
													})
												}
											})
										}
									})
								}
							})
						}
					})
				}
			})
		}
	})
}
module.exports = router;
