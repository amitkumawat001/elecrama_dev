'use strict';

const local = "mongodb://pankaj:pankaj@ds125481.mlab.com:25481/electrama"
const live = "mongodb://localhost:27017/elecrama_live";
const development = "mongodb://localhost:27017/elecrama_dev1";
const test = "mongodb://localhost:27017/elecrama_test1";
const beta = "mongodb://localhost:27017/elecrama_beta";

const mongodbURI = {
    live: live,
    beta: beta,
    development: development,
    test: test,
    local: local
};

module.exports = {
    mongodbURI: mongodbURI
};