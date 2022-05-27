const express = require('express')
const router = express.Router()
const{createUser} =require('../controllers/userController')
const {updateUser}=require('../controllers/userController')
const {loginUser}=require('../controllers/userController')
const {getById} = require('../controllers/userController')
const Mw = require('../middleware/auth')
const {updateProduct,createProduct,getProduct,getProductById,deleteProductById} = require('../controllers/productController')

//User's Api
router.post("/register",createUser)
router.post("/userLogin",loginUser)
router.get("/getuser",Mw.userAuth,getById)
router.put("/updateUser/:userId", Mw.userAuth,updateUser)

//product's Api
router.post("/createProduct",createProduct)
router.get("/getProductByfilter",getProduct)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProductById)

module.exports = router;