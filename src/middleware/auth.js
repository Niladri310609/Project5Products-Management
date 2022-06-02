const jwt = require('jsonwebtoken')
const {isValidObjectId} = require('../validation/validation')

const authentication = async (req, res, next) => {
    try {
        const token = req.header('Authorization', 'Bearer Token') || req.header('authorization', 'Bearer Token')

        if (!token) {
            return res.status(401).send({ status: false, message: `Missing authentication token in request` })
        }

        let T = token.split(' ')
        //console.log(T)
        let timeOut = jwt.decode(T[1], 'Hercules')
        console.log(T[0], T[1])

        

        if (Date.now() > (timeOut.exp) * 1000) {
            return res.status(401).send({ status: false, message: `Session Expired, please login again` })
        }

        req.userId = timeOut.userId

        next()
    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}

const authorization = (req, res, next) => {

    try {

        let tokenUserId = req.userId
        let userId = req.params.userId
        
//console.log(userId)
      if (!isValidObjectId(userId)) {
    return res.status(400).send({ status: false, message: "Invalid User Id" })
}

        if (tokenUserId.toString() !== userId) {
            return res.status(403).send({ status: false, message: "unauthorized access" })
        }
        next()

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
    module.exports = { authentication,authorization}