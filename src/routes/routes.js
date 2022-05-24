const express = require('express')
const router = express.Router()
const{createUser} =require('../controllers/mz')







//create user

router.post("/register",createUser)
module.exports = router;