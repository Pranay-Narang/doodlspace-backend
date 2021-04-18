const admin = require('firebase-admin')

const model = require('../models/designer.model')

const add = async (req, res) => {
    const designer = new model(req.body)

    try {
        await admin.auth().setCustomUserClaims(req.body.uid, {
            role: 'designer'
        })

        await designer.save()
        res.status(201).send(designer)
    } catch (e) {
        res.status(404).send({ error: 'User not found' })
    }
}

module.exports.add = add

const read = async (req, res) => {
    try {
        const designers = await model.find({})
        res.send(designers)
    } catch (e) {
        res.status(500).send()
    }
}

module.exports.read = read

const update = async (req, res) => {
    const allowedFields = ["name", "email", "phone"]
    const updates = Object.keys(req.body)
    const designer = await model.findOne({ uid: req.params.id })

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    try {
        updates.forEach((elem) => designer[elem] = req.body[elem])
        await designer.save()
        res.send(designer)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const remove = async (req, res) => {
    const designer = await model.findOne({ uid: req.params.id })
    try {
        await designer.remove()
        res.send(designer)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove