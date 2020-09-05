const mongoose = require('mongoose')

const faqschema = new mongoose.Schema({
    question:{type: String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref: 'Users'},
    answer:{type: String}
})

module.exports = faqschema