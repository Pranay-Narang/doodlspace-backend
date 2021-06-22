const mongoose = require("mongoose")
const validator = require("validator")

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
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    }, {
        timestamps: true
    }
)

const Brand = mongoose.model('Brand', schema)

module.exports = Brand