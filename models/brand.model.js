const mongoose = require("mongoose")
const validator = require("validator")
const AutoIncrement = require('mongoose-sequence')(mongoose)

const socialSchema = new mongoose.Schema({
    name: String,
    URL: String
})

const fontSchema = new mongoose.Schema({
    family: String,
    variant: String,
    URL: String
})

const schema = new mongoose.Schema(
    {
        cid: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: String,
        colors: Array,
        social: [socialSchema],
        logo: Array,
        assets: Array,
        stockimages: Array,
        stockimagelinks: Array,
        inspirationallinks: [String],
        targetaudience: [String],
        fonts: [fontSchema],
        storedfonts: [],
        brid: {
            def: {type: String, default: "BR"},
            year: {type: String},
            seq: {type: Number}
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    }, {
        timestamps: true
    }
)

schema.plugin(AutoIncrement, {inc_field: 'brid.seq'})

schema.pre('save', async function (next) {
    this.brid.year = new Date().getFullYear().toString().substr(2, 2)
    next()
})

const Brand = mongoose.model('Brand', schema)

module.exports = Brand