const express = require('express')
const router = express.Router()
const{createUser} =require('../controllers/mz')
const {updateUser}=require('../controllers/Nil')
const {loginUser}=require('../controllers/Nil')
const {userAuth}=require('../middleware/auth')






//create user

router.post("/register",createUser)
//login api
router.post("/userLogin",loginUser)
// update User
router.put("/updateUser/:userId",updateUser)
module.exports = router;