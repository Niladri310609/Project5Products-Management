const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { isValid, isValidRequestBody, isValidObjectId,validQuantity} = require('../validation/validation')

const cartCreation = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;
        const { quantity, productId } = requestBody;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide valid request body" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });
        }

        if (!isValidObjectId(productId) || !isValid(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid Product Id" });
        }

        if (!isValid(quantity) || !validQuantity(quantity)) {
            return res.status(400).send({ status: false, message: "Please provide valid quantity & it must be greater than zero." });
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
                totalItems: 1,
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
        }

        if (findCartOfUser) {

            let price = findCartOfUser.totalPrice + req.body.quantity * findProduct.price;

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
       //=================================================== Checking the authorization =================================================== 
       
       if (findUserProfile.userId.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });

        }
       //===================================================  Finding the Cart details===================================================  
        const findCart = await cartModel.findOne({ userId: userId }).populate("items.productId", { _id: 1, title: 1,price: 1, productImage: 1,availableSizes: 1,})
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });

        if (!findCart) {
            return res.status(400).send({ status: false, message: `Cart doesn't exists by ${userId} ` });
        }

        return res.status(200).send({ status: true, message: "Successfully fetched cart.", data: findCart });
    } catch (err) {
        return res.status(500).send({ status: false, message: "Error is : " + err });
    }
};


module.exports={cartCreation,getCart}