const express = require('express')
const ewasteModel = require('../models/Ewaste.model')
const router = new express.Router()
const auth = require('../middleware/auth')
const upload = require('../db/upload')

//Route for creating e-waste product
router.post('/create',auth, upload.fields([{name:'gallery', maxCount:8}]),async (req, res) => {
    const ewaste = new ewasteModel(req.body)
    ewaste.owner = req.user._id

    try{
        if(req.files){
            let all_file = req.files['gallery']
            pics_url = all_file.map((file) => {return file.filename})
            ewaste.photos = pics_url
        }
        await ewaste.save()
        res.status(201).send(ewaste)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

//Route for deleting ewaste product
router.post('/delete/:id',auth,async (req, res)=> {
    
    const id = req.params.id
    const ewatses = await ewasteModel.find({owner:req.user._id})

    try{
        await ewasteModel.deleteOne({_id:id})
        res.status(200).send(ewastes)
    }catch(e){
        res.status(400).send(e)
    }

})

//Route for sending all on sale ewastes by user
router.get('/all/me',auth,async(req,res) => {

    try{
        const all_ewaste = await ewasteModel.find({owner: req.user._id})
        res.status(200).send(all_ewaste)
    }catch(e){
        res.status(400).send(e)
    }

})

//Route for sending all ewastes on sale
router.get('/all', auth, async(req, res)=>{

    try{
        const ewastes = await ewasteModel.find()
        res.send(ewastes)
    }catch(e){
        res.status(400).send(e)
    }
})

//Route for sending e-wastes by location filter
router.get('/all/:pin', auth, async(req, res) => {

    try{
        const ewastes = await ewasteModel.find({pincode:req.params.pin})
        res.send(ewastes)
    }catch(e){
        res.status(400).send(e)
    }
})

module.exports = router