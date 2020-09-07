const mongoose = require('mongoose');
const joi = require('joi');
const {schemaUser} = require('./users')

const schemaComment= new mongoose.Schema({
   user : [schemaUser],
   commment : 
   {
       type : String,
       required: true
   }
});

const Comment = mongoose.model('comment', schemaComment );
async function validateComment(comment) {
    const schema = await
        {
            user : joi.array().required() ,
            comment : joi.string().required(),
        }
    return joi.validate(comment, schema)
}
exports.schemaComment = schemaComment;
exports.Comment = Comment;
exports.validateUser = validateComment;