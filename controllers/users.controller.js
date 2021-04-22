const admin = require('firebase-admin')

const read = async (req, res) => {
    const users = await admin.auth().listUsers()
    res.send(users.users)
}

module.exports.read = read