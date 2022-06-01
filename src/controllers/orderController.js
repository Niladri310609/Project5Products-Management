const userModel = require("../models/userModel");
const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const { isValidRequestBody, isValidObjectId, isValidStatus } = require('../validation/validation')



const orderCreation = async (req, res) => {
    try {
        let userId = req.params.userId;
        let requestBody = req.body;
        let userIdFromToken = req.userId
        let { cartId, cancellable, status } = requestBody;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed." });
        }
        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({ status: false, message: `Cancellable must be either 'true' or 'false'.` });
            }
        }

        if (status) {
            if (status !== 'pending') {
                return res.status(400).send({ status: false, message: "status must be Pending during creation of order" })
            }
        }
        
      

        if (!isValidObjectId(userId)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid userId in params." });
        }

        const searchUser = await userModel.findOne({ _id: userId });
        if (!searchUser) {
            return res.status(404).send({ status: false, message: `user doesn't exist for ${userId}` });
        }
        if (searchUser._id.toString() != userIdFromToken) {
            return res.status(403).send({ status: false, message: `Unauthorized access! User's info doesn't match` });

        }

        if (!cartId) {
            return res.status(400).send({ status: false, message: `Cart Id is required` });
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `Invalid cartId in request body.` });

        }
        const searchCartDetails = await cartModel.findOne({ _id: cartId, userId: userId });

        if (!searchCartDetails) {
            return res.status(404).send({ status: false, message: `Cart doesn't belongs to ${userId}` });
        }

       

        if (!searchCartDetails.items.length) {
            return res.status(204).send({ status: false, message: `Please add some products in cart to make an order.` });
        }
        //adding quantity of every products
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        let totalQuantity = searchCartDetails.items.map((x) => x.quantity).reduce(reducer);

        const orderDetails = {
            userId: userId,
            items: searchCartDetails.items,
            totalPrice: searchCartDetails.totalPrice,
            totalItems: searchCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        };
        const savedOrder = await orderModel.create(orderDetails);

        //Empty the cart after the successfull order
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, {
            $set: {
                items: [],
                totalPrice: 0,
                totalItems: 0,
            },
        });
        return res.status(200).send({ status: true, message: "Order placed.", data: savedOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports = { orderCreation }