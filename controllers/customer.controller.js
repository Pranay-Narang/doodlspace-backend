const admin = require('firebase-admin')

const model = require('../models/customer.model')

const add = async (req, res) => {
    const customer = new model({
        uid: req.uid,
        ...req.body
    })

    try {
        await admin.auth().setCustomUserClaims(req.uid, {
            role: 'customer'
        })

        await customer.save()
        await customer.populate('designers').execPopulate()
        res.status(201).send(customer)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    const customer = await model.find().populate('designers')
    res.send(customer)
}

module.exports.read = read

const update = async (req, res) => {
    const allowedFields = ["name", "email", "phone", "designers"]
    const updates = Object.keys(req.body)
    const customer = await model.findOne({ uid: req.params.id })

    const validOperation = updates.every((elem) => allowedFields.includes(elem))
    if (!validOperation) {
        return res.status(400).send({ error: "Invalid operation" })
    }

    try {
        updates.forEach((elem) => customer[elem] = req.body[elem])
        await customer.save()
        await customer.populate('designers').execPopulate()
        res.send(customer)
    } catch (e) {
        res.status(400).send(e)
    }
}

module.exports.update = update

const remove = async (req, res) => {
    const customer = await model.findOne({ uid: req.params.id })
    try {
        await customer.remove()
        res.send(customer)
    } catch (e) {
        res.status(404).send(e)
    }
}

module.exports.remove = remove