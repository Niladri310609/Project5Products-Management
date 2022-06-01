const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { isValid, isValidRequestBody,isValidObjectId,validQuantity} = require('../validation/validation')


const cartCreation = async (req, res) => {
    try {
        let userId = req.params.userId;
         let  requestBody = req.body;
         let tokenUserId = req.userId
        let { quantity, productId } = requestBody;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });
        }
        if (!isValidObjectId(tokenUserId)) {
            return res.status(400).send({ status: false, message: "Token is not Valid" });
        }
        

        if (!isValidObjectId(productId) || !isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid Product Id" });
        }

         if(!quantity) {quantity=1}
         
         
          else if(quantity){
        if (!isValid(quantity) || !validQuantity(quantity)) {
            return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." });
        }
    }

        const findUser = await userModel.findById({ _id: userId });

        if (!findUser) {
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });
        }
        

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct) {
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });
        }

        const findCartOfUser = await cartModel.findOne({ userId: userId });
        let e = findProduct.price
    
        if (!findCartOfUser) {
            var cartData = {
                userId: userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity,
                    },
                ],
                totalPrice: findProduct.price * quantity,
                
                totalItems: 1
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
        }

        if (findCartOfUser) {

            let price = findCartOfUser.totalPrice + quantity * findProduct.price;

            let arr = findCartOfUser.items;

            for (i in arr) {
                if (arr[i].productId.toString() === productId) {
                    arr[i].quantity += quantity;

                    let updatedCart = {
                        items: arr,
                        totalPrice: price,
                        totalItems: arr.length,
                    };

                    let responseData = await cartModel.findOneAndUpdate(
                        { _id: findCartOfUser._id },
                        updatedCart,
                        { new: true }
                    );
                    return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
                }
            }
            arr.push({ productId: productId, quantity: quantity });

            let updatedCart = {
                items: arr,
                totalPrice: price,
                totalItems: arr.length,
            };

            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true });
            return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
        }

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};


//============================================================== Get Cart details ==============================================================

const getCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let userIdFromToken = req.userId

        //=================================================== validations for UserId and Token =================================================== 
       
       
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }
        if (!isValidObjectId(userIdFromToken)) {
            return res.status(400).send({ status: false, message: `Token is not Valid` })
        }


        //=================================================== Find the user By Id =================================================== 
      
      
      
        const findUserProfile = await userModel.findById({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
      
       //===================================================  Finding the Cart details===================================================  
        const findCart = await cartModel.findOne({ userId: userId }).populate("items.productId", { title: 1,price: 1, productImage: 1,availableSizes: 1,})
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });

        if (!findCart) {
            return res.status(400).send({ status: false, message: `Cart doesn't exists by ${userId} ` });
        }

        return res.status(200).send({ status: true, message: "Successfully fetched cart.", data: findCart });
    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is : " + err });
    }
};


const updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        let { productId, cartId, removeProduct } = req.body
        let userIdFromToken = req.userId

        productId=productId.toString().trim()
        cartId=cartId.toString().trim()
        removeProduct = removeProduct.toString().trim()

        if (!cartId) {
            return res.status(400).send({ status: false, message: "cartId be must required..." })
        }
        if (!productId) {
            return res.status(400).send({ status: false, message: "productId must be required..." })
        }
        if (removeProduct != 0 && !removeProduct) {
            return res.status(400).send({ status: false, message: "removeProduct key must be required..." })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Not a valid userId" })
        }
        if(!isValidObjectId(userIdFromToken)){
            return res.status(400).send({status:false ,message : "Token is not Valid"})
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Not a valid cartId" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Not a valid ProductId" })
        }

        if (!(removeProduct == "1" || removeProduct == "0")) {
            return res.status(400).send({ status: false, message: "removeProduct value only can be 0 or 1" })
        }

        const userIdInDB = await userModel.findOne({ _id: userId })

        if (!userIdInDB) {
            return res.status(404).send({ status: false, message: "userId does not exist" })
        }
        if(userIdInDB._id.toString() !==userIdFromToken){
            return res.status(401).send({status:false, message: "Unauthorized access to user"})
        }

        const cartInDB = await cartModel.findOne({ _id: cartId })
       
        if (!cartInDB) {
            return res.status(404).send({ status: false, message: "cartId does not exist" })
        }

        const productInDB = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productInDB) {
            return res.status(404).send({ status: false, message: "productId does not exist" })
        }

        const productIdInCart = await cartModel.findOne({ userId: userId, "items.productId": productId })

        if (!productIdInCart) {
            return res.status(404).send({ status: false, message: "productId does not exist in this cart" })
        }
        let { items } = cartInDB
        let getPrice = productInDB.price

        for (let i = 0; i < items.length; i++) {
            if (items[i].productId == productId) {

                let totelProductprice = items[i].quantity * getPrice

                if (removeProduct == 0 || (items[i].quantity == 1 && removeProduct == 1)) {

                    const removeCart = await cartModel.findOneAndUpdate({ userId: userId },
                        {
                            $pull: { items: { productId: productId } },
                            $inc: {
                                totalPrice: - totelProductprice,
                                totalItems: - 1
                            }
                        },
                        { new: true })

                    return res.status(200).send({ status: true, message: 'sucessfully removed product from cart', data: removeCart })

                }

                const product = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": -1, totalPrice: -getPrice } }, { new: true })

                return res.status(200).send({ status: true, message: 'sucessfully decrease one qty of product', data: product })
            }
        }

    }

    catch (error) {

        return res.status(500).send({ status: false, error: error.message })
    }
}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {
             return res.status(404).send({ status: false, message: "Invalid User Id" })
         }
         if (!isValidObjectId(userIdFromToken)) {
             return res.status(404).send({ status: false, message: `Token is not Valid` })
         }

        const findUserCart = await cartModel.findOne({ userId:userId})

        if (!findUserCart) {
            return res.status(404).send({ status: false, message: "No user found" })
        }
    
        if(findUserCart.items.length==0){
            return res.status(400).send({ status: false, message: "Products are already deleted in the cart" })
        }
        await cartModel.findOneAndUpdate({ userId:userId }, { $set: {items:[],totalItems: 0, totalPrice: 0 } }, { new: true })
        return res.status(204).send({ status: false, message: "Cart deleted succesfully" })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


module.exports={cartCreation,getCart,updateCart,deleteCart}