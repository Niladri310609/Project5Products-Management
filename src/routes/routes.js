const express = require('express')
const router = express.Router()

const{createUser,loginUser,updateUser,getById} =require('../controllers/userController')
const { authentication,authorization} = require('../middleware/auth')
const {updateProduct,createProduct,getProduct,getProductById,deleteProductById} = require('../controllers/productController')
const{cartCreation,getCart,updateCart,deleteCart}= require('../controllers/cartController')
const{orderCreation,updateOrder} = require("../controllers/orderController")





//User's Api
router.post("/register",createUser) // Arup
router.post("/login",loginUser) // Nil
router.get("/user/:userId/profile",authentication,getById) // CHANDU
router.put("/user/:userId/profile",authentication,authorization,updateUser) //Mubashir

//product's Api
router.post("/products",createProduct) // Arup
router.get("/products",getProduct) // Nil
router.get("/products/:productId",getProductById) // Mubashir
router.put("/products/:productId",updateProduct) //Chandu
router.delete("/products/:productId",deleteProductById) //Mubashir

//Cart's Api
router.post("/users/:userId/cart",authentication,cartCreation,authorization)//Nil
router.get("/users/:userId/cart",authentication,getCart) // Arup
router.put("/users/:userId/cart",authentication,authorization,updateCart) //Chandu
router.delete("/users/:userId/cart",authentication,authorization,deleteCart) //Mubashir


//Order's Api
router.post("/users/:userId/orders",authentication,authorization,orderCreation) // Chandu
router.put("/users/:userId/orders",authentication,authorization,updateOrder) // Arup



//if api is invalid OR wrong URL
router.all("/*", function (req, res) {
  res.status(404).send({ status: false, msg: "The api you requested is not available" });
});

module.exports = router;