const mongoose = require('mongoose')
const validator = require('validator')

const textSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    used_for: {type: String},
    thumbnail: {type: String, required: true},
    photos: [String],
    author: {
        type: String,
    },
    edition: {
        type: Number
    },
    pincode: {type:Number, required: true},
    location: {type:String, required: true},
    owner: {type:mongoose.Schema.Types.ObjectId, required: true, ref: 'Users'}
},{
    timestamps: true
})

textSchema.methods.toJSON = function(){
    const twaste = this

    const twasteObject = twaste.toObject()

    delete twasteObject.location
    delete twasteObject.description
    delete twasteObject.owner

    return twasteObject
}

const textModel = mongoose.model('Textbooks',textSchema)
module.exports = textModel