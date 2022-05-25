const express = require('express')
const router = express.Router()
const{createUser} =require('../controllers/userController')
const {updateUser}=require('../controllers/userController')
const {loginUser}=require('../controllers/userController')
const Mw = require('../middleware/auth')







//create user

router.post("/register",createUser)
//login api
router.post("/userLogin",loginUser)
// update User
router.put("/updateUser/:userId", Mw.userAuth,updateUser)

module.exports = router;