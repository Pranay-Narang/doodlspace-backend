const CONFIG = require('../config/config');

const model = require('../models/brand.model')

const preSigner = require('../utils/urlgenerator.util')

const add = async (req, res) => {
    var assets = []
    var stockimages = []
    var logo = []
    var storedfonts = []

    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }
    if (req.files.stockimages) {
        stockimages = req.files.stockimages.map(image => image.key)
    }
    if (req.files.logo) {
        logo = req.files.logo.map(e => e.key)
    }
    if (req.files.storedfonts) {
        storedfonts = req.files.storedfonts.map(e => e.key)
    }

    if(req.body.brid) {
        return res.status(400).send({error: "Cannot set ID explicitly"})
    }

    const brand = new model({
        cid: req.uid,
        ...req.body,
        assets,
        stockimages,
        logo,
        storedfonts
    })

    try {
        await brand.save()
        brand['assets'] = await preSigner(brand, 'assets')
        brand['stockimages'] = await preSigner(brand, 'stockimages')
        brand['logo'] = await preSigner(brand, 'logo')
        brand['storedfonts'] = await preSigner(brand, 'storedfonts')
        res.status(201).send(brand)
    } catch (e) {
        res.status(500).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    try {
        const brands = req.query.cid ? await model.find({ cid: req.query.cid }) : await model.find()
        await Promise.all(brands.map(async elem => {
            elem['assets'] = await preSigner(elem, 'assets')
            elem['stockimages'] = await preSigner(elem, 'stockimages')
            elem['logo'] = await preSigner(elem, 'logo')
            elem['storedfonts'] = await preSigner(elem, 'storedfonts')
            return elem
        }))
        res.send(brands)
    } catch (e) {
        console.log(e)
        res.status(404).send(e)
    }
}

module.exports.read = read

const readOne = async (req, res) => {
    try {
        const brand = await model.findById(req.params.id)
        brand['assets'] = await preSigner(brand, 'assets')
        brand['stockimages'] = await preSigner(brand, 'stockimages')
        brand['logo'] = await preSigner(brand, 'logo')
        brand['storedfonts'] = await preSigner(brand, 'storedfonts')
        res.send(brand)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.readOne = readOne

const update = async (req, res) => {
    const allowedFields = ["name", "description", "colors", "social", "assets",
        "stockimages", "inspirationallinks", "targetaudience",
        "logo", "storedfonts", "fonts", "status"]
    const updates = Object.keys(req.body)
    const brand = await model.findById(req.params.id)

    var assets = []
    var stockimages = []
    var logo = []
    var storedfonts = []

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    if (req.files.assets) {
        assets = req.files.assets.map(asset => asset.key)
    }
    if (req.files.stockimages) {
        stockimages = req.files.stockimages.map(image => image.key)
    }
    if (req.files.logo) {
        logo = req.files.logo.map(e => e.key)
    }
    if (req.files.storedfonts) {
        storedfonts = req.files.storedfonts.map(e => e.key)
    }

    try {
        updates.forEach((elem) => brand[elem] = req.body[elem])

        brand['assets'] = brand['assets'].concat(assets)
        brand['stockimages'] = brand['stockimages'].concat(stockimages)
        brand['logo'] = brand['logo'].concat(logo)
        brand['storedfonts'] = brand['storedfonts'].concat(storedfonts)

        await brand.save()
        res.send(brand)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const remove = async (req, res) => {
    const brand = await model.findById(req.params.id)

    if (req.role == 'customer' && req.uid != brand.cid) {
        return res.status(401).send({ error: 'Access denied' })
    }

    try {
        await brand.remove()
        res.send(brand)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove