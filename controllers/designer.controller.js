const admin = require('firebase-admin')

const model = require('../models/designer.model')
const customerModel = require('../models/customer.model')

const add = async (req, res) => {
    try {
        const designerRecord = await admin.auth().createUser({
            email: req.body.email,
            emailVerified: true,
            phoneNumber: req.body.phone,
            displayName: req.body.name,
        })

        await admin.auth().setCustomUserClaims(designerRecord.uid, {
            role: 'designer'
        })

        const designer = new model({
            uid: designerRecord.uid,
            ...req.body
        })

        await designer.save()
        res.status(201).send(designer)
    } catch (e) {
        res.status(500).send(e)
    }
}

module.exports.add = add

const read = async (req, res) => {
    try {
        if (req.role == 'designer') {
            const designer = await model.find({ uid: req.uid }).populate('supervisor')
            return res.send(designer)
        }
        if (req.role == 'supervisor') {
            const designers = await model.find({sid: req.uid})
            return res.send(designers)
        }
        const designers = await model.find({}).populate('supervisor')
        res.send(designers)
    } catch (e) {
        res.status(500).send(e)
    }
}

module.exports.read = read

const update = async (req, res) => {
    const allowedFields = ["name", "email", "phone", "sid"]
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

const readCustomers = async (req, res) => {
    const customers = await customerModel.find({ designers: req.params.id })
    res.send(customers)
}

module.exports.readCustomers = readCustomers