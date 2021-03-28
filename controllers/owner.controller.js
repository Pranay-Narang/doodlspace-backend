const admin = require('firebase-admin')

const model = require('../models/owner.model')

const add = async (req, res) => {
    const owner = new model(req.body)

    try {
        await admin.auth().setCustomUserClaims(req.body.uid, {
            role: 'owner'
        })

        await owner.save()
        res.status(201).send(owner)
    } catch (e) {
        res.status(404).send({ error: 'User not found' })
    }
}

module.exports.add = add

const read = async (req, res) => {
    try {
        const owners = await model.find({})
        res.send(owners)
    } catch (e) {
        res.status(500).send()
    }
}

module.exports.read = read

const update = async (req, res) => {
    const allowedFields = ["name", "email", "phone"]
    const updates = Object.keys(req.body)
    const owner = await model.findOne({ uid: req.params.id })

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    try {
        updates.forEach((elem) => owner[elem] = req.body[elem])
        await owner.save()
        res.send(owner)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const remove = async (req, res) => {
    const owner = await model.findOne({ uid: req.params.id })
    try {
        await owner.remove()
        res.send(owner)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove