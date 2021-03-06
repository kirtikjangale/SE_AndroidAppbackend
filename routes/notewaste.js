const express = require('express')
const router = new express.Router()
const nwasteModel = require('../models/Notebooks.model')
const auth = require('../middleware/auth')
const upload = require('../db/upload')

//Route for creating text-waste product
router.post('/create',auth, upload.fields([{name:'thumbnail',maxCount:1},{name:'gallery', maxCount:8}]),async (req, res) => {
    const nwaste = new nwasteModel(req.body)
    nwaste.owner = req.user._id

    try{
        if(req.files){
            if(!req.files['thumbnail']){
                throw new Error('thumbnail pic is required')
            }
            const thumbnail_url = req.files['thumbnail'][0].filename
            let all_file = req.files['gallery']
            pics_url = all_file.map((file) => {return file.filename})
            nwaste.photos = pics_url
            nwaste.thumbnail = thumbnail_url
        }
        await nwaste.save()
        res.status(201).send(nwaste)
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

//Route for deleting nwaste product
router.post('/delete/:id',auth,async (req, res)=> {
    
    const id = req.params.id

    try{
        const nwaste = await nwasteModel.findOne({owner:req.user._id, _id:id})
        if(nwaste){
            await nwasteModel.deleteOne({_id:id})
            res.status(200).send({msg:"Deleted successfully"})
        }else{
            throw new Error('Only owner can delete sell item')
        }
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }

})

//Route for viewing individual nwaste (authenticated)
router.get('/view/:id',auth, async(req, res) => {
    const id = req.params.id

    try{
        const nwaste = await (await nwasteModel.findById(id)).toObject()
        res.send(nwaste)
    }catch(e){
        res.status(400).send(e)
    }
})

//Route for viewing individual nwaste (not authenticated)
//Seller info will not be available to user
router.get('/view_noauth/:id', async(req, res) => {
    const id = req.params.id

    try{
        let nwaste = await nwasteModel.findById(id)

        nwaste = {
            _id: nwaste._id,
            name: nwaste.name,
            thumbnail: nwaste.thumbnail,
            price: nwaste.price,
            description: nwaste.description,
            pincode: nwaste.pincode,
            photos: nwaste.photos,
            faqs: nwaste.faqs,
            location: "Login to get full info",
            owner: "Login to get full info"
        }
        res.send(nwaste)

    }catch(e){
        res.status(400).send(e)
    }
})

//Route for sending all on sale nwastes by user
router.get('/all/me',auth,async(req,res) => {

    try{
        const all_nwaste = await nwasteModel.find({owner: req.user._id})
        res.status(200).send(all_nwaste.map((nwaste) => {return nwaste.toObject()}))
    }catch(e){
        res.status(400).send(e)
    }

})

//Route for sending all nwastes on sale
router.get('/all', async(req, res)=>{

    try{
        const nwastes = await nwasteModel.find()
        let nwastes_mod = nwastes.map(nwaste => {return nwaste.toJSON()})        
        res.send(nwastes_mod)

    }catch(e){
        res.status(400).send(e)
    }
})

//Route for sending nwastes by location filter
router.get('/all/:pin', async(req, res) => {

    try{
        const nwastes = await nwasteModel.find({pincode:req.params.pin})
        
        let nwastes_mod = nwastes.map(nwaste => {return nwaste.toJSON()})        
        res.send(nwastes_mod)

    }catch(e){
        res.status(400).send(e)
    }
    
})

//Route for asking query regarding product
router.post('/ask/:id', auth, async(req, res) => {
    try{
        const nwaste = await nwasteModel.findById(req.params.id)
        const faq = {
            question: req.body.question,
            owner: req.user._id,
            name: req.user.name 
        }
        nwaste.faqs.push(faq)
        await nwaste.save()
        res.status(201).send({msg:"Successfully created"})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

//Route for answering question
router.post('/answer/:id', auth, async(req,res) => {
    try{
        const nwaste = await nwasteModel.findById(req.params.id)
        if(!req.user._id.equals(nwaste.owner)){
            throw new Error('Only seller can answer to the query')
        }
        nwaste.faqs.find((faq) => faq._id.equals(req.body.id)).answer = req.body.answer
        await nwaste.save()
        res.send({msg:"Successfully answered the query"})
    }catch(e){
        console.log(e)
        res.status(400).send({msg:"Some error occured please make sure you are the owner of this product"})
    }   
})

module.exports = router