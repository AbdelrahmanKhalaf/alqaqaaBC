const mongoose = require('mongoose');
const joi = require('joi');

const schemaEvaluation = new mongoose.Schema({
    comment: {
        type: String,
        require: true,
        maxlength: 60,
        required: true

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"

    },
    date: {
        type: Date,
        default: Date.now()
    }
});
const Evaluation = mongoose.model('evaluation', schemaEvaluation);
async function validateEvaluation(evaluation) {
    const schema = await {
        comment: joi.string().required().max(60),
        users: joi.string()
    }
    return joi.validate(evaluation, schema)
};
exports.schemaEvaluation = schemaEvaluation;
exports.Evaluation = Evaluation;
exports.validateEvaluation = validateEvaluation;