const jwt = require('jsonwebtoken')
//const userModel = require('../models/userModel')

/*const authentication = (req, res, next) => {

    try {
        let bearer = req.headers["Authorization"] || req.headers["authorization"]
        //if (!bearer) bearer = req.headers["authorization"]
        if (!bearer) {
            return res.status(400).send({ status: false, msg: "Token must be present in the bearer" });
        }
        const splitToken = bearer.split(' ');
        const token = splitToken[1]
        const decodedToken = jwt.verify(token, "Hercules")

        if (!decodedToken) {
            return res.status(403).send({ status: false, msg: "Invalid authentication token in request" })
        }
        req.decodedToken = decodedToken

        next()

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const authorization = async (req, res, next) => {

    try {
        let userId = req.params.userId
        let decodedToken = req.decodedToken
      
            let findUserId = await userModel.findOne({userId})
           
        if(!findUserId) {
            return res.status(404).send({status:false, msg:"User doesn't exist"})
        }
        /*let bearer = req.headers["authorization"] || req.headers['Authorization']
        if (!bearer) {
            return res.status(400).send({ status: false, msg: "Token is not present in bearer" });
        }
        const splitToken = bearer.split(' ');
        const token = splitToken[1]
        const decodedToken = jwt.verify(token, "Hercules")

        if (decodedToken.userId != userId) {
            return res.status(401).send({ status: false, msg: "unathorized access" })
        }

        next()

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = {authentication,authorization}*/



const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization', 'Bearer Token')|| req.header('authorization' , 'Bearer Token')


        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }

        let T = token.split(' ')
        //console.log(T)
        let timeOut = jwt.decode(T[1], 'Hercules')


        if (!timeOut) {
            return res.status(403).send({ status: false, message: `Invalid authentication token in request ` })
        }

        if (Date.now() > (timeOut.exp) * 1000) {
            return res.status(404).send({ status: false, message: `Session Expired, please login again` })
        }

        req.userId = timeOut.userId

        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {
    userAuth
}