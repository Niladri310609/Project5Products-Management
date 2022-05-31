const express = require('express')
const router = express.Router()
const{createUser} =require('../controllers/userController')
const {updateUser}=require('../controllers/userController')
const {loginUser}=require('../controllers/userController')
const {getById} = require('../controllers/userController')
const Mw = require('../middleware/auth')
const {updateProduct,createProduct,getProduct,getProductById,deleteProductById} = require('../controllers/productController')
const{cartCreation,getCart,updateCart,deleteCart}= require('../controllers/cartController')
const{orderCreation} = require("../controllers/orderController")
//User's Api
router.post("/register",createUser)
router.post("/userLogin",loginUser)
router.get("/getuser/:userId",Mw.userAuth,getById)
router.put("/updateUser/:userId", Mw.userAuth,updateUser)

//product's Api
router.post("/createProduct",createProduct)
router.get("/getProductByfilter",getProduct)
router.get("/products/:productId",getProductById)
router.put("/products/:productId",updateProduct)
router.delete("/products/:productId",deleteProductById)

//Cart's Api
router.post("/users/:userId/cart",Mw.userAuth,cartCreation)
router.get("/users/:userId/cart",Mw.userAuth,getCart)
router.put("/users/:userId/cart",Mw.userAuth,updateCart)
router.delete("/users/:userId/cart",Mw.userAuth,deleteCart)


//Order's Api
router.post("/users/:userId/orders",Mw.userAuth,orderCreation)



//if api is invalid OR wrong URL
router.all("/*", function (req, res) {
  res.status(404).send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;