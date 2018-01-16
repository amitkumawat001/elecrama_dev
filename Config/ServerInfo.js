'use strict';

const local = "https://elecarama.herokuapp.com"
const live = "";
const development = "http://elecrama-lb-2063689864.ap-south-1.elb.amazonaws.com:3001";
const test = "http://elecrama-lb-2063689864.ap-south-1.elb.amazonaws.com:3002";
const beta = "http://elecrama-lb-2063689864.ap-south-1.elb.amazonaws.com:3003";

const ServerBaseUrl = {
    live: live,
    beta: beta,
    development: development,
    test: test,
    local: local
};

module.exports = {
    ServerBaseUrl: ServerBaseUrl
};