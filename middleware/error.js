const logError = require('winston');
module.exports = function(err , req , res , next){
    logError.error(err.message, err)
    //error
    //warn
    //info
    //verbose
    //debug
    //silly
    res.status(500).send(err.message);
}