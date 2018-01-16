var Constants = require('../../Config/constants');
module.exports = {
function OTP_genrate(){
	var min = Math.ceil(Constants.OTP_LENGTH.min);
  	var max = Math.floor(Constants.OTP_LENGTH.max);
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}
};