/*
* Firebase Authorization Middleware
*
* Example usage with basic verification:
*         router.get('/', auth(), controller) 
* 
* Example usage with RBAC:
*         router.get('/', auth({hasRole: ['admin', 'user']}), controller)          
*/
const admin = require("firebase-admin");

module.exports = (options) => {
    return async (req, res, next) => {
        try {
            const decodedToken = await admin
                .auth()
                .verifyIdToken(req.header('Authorization').replace('Bearer ', ''))

            req.uid = decodedToken.uid
            
            if(decodedToken.role) {
                req.role = decodedToken.role
            }

            if (!options) {
                return next()
            }

            var allow = options.hasRole.some(elem => elem == decodedToken.role)
            if (!allow) {
                return res.status(401).send({ error: 'Invalid role' })
            }
            next()

        } catch (e) {
            res.status(401).send({ error: 'Access denied' })
        }
    }
}