const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { isValid, isValidRequestBody, isValidObjectId,isValidNumber, isValidScripts, validString,validInstallment } = require('../validation/validation')




const getCart = async (req, res) => {
    try {
        const userId = req.params.userId;
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
       
       if (findUserProfile._id.toString() != userIdFromToken) {
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

module.exports={getCart}