const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const { isValid, isValidRequestBody,isValidObjectId,validQuantity} = require('../validation/validation')




const createProduct = async (req, res) => {
    try {
        const requestBody = req.body;
        //========================================== validations for inputs===============================================
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }
        if (requestBody.isDeleted && requestBody.isDeleted != "false") {
            return res.status(400).send({ status: false, message: "Product cannot be deleted while updation" })
        }


        const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = requestBody;

        //========================================== validations for title ================================================ 

        if (title == "") {
            return res.status(400).send({ status: false, message: "Title  cannot be empty" })
        } else if (title) {
            if (!validString(title) || !isValidScripts(title))
                return res.status(400).send({ status: false, message: "Title is invalid (Should Contain Alphabets, numbers, quotation marks  & [@ , . ; : ? & ! _ - $]." })
            const isTitleAlreadyUsed = await productModel.findOne({ title });

            if (isTitleAlreadyUsed) {
                return res.status(400).send({ status: false, message: 'Title is already used.' })
            }
        }
        //========================================== validations for description ================================================  

        if (description == "") {
            return res.status(400).send({ status: false, message: "Description  cannot be empty" })
        } else if (description) {
            if (!validString(description) || !isValidScripts(description))
                return res.status(400).send({ status: false, message: "description is not in valid format" })
        }


        //========================================== validations for Price ================================================ 
        if (!validString(price)) {
            return res.status(400).send({ status: false, message: 'Price is required' })
        }

        if (!(!isNaN(Number(price)))) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` })
        }
        if (price <= 0) {
            return res.status(400).send({ status: false, message: `Price cannot be Zero` })
        }
        //========================================== validations for currencyId ================================================ 
        if (!validString(currencyId)) {
            return res.status(400).send({ status: false, message: 'CurrencyId is required' })
        }

        if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: 'currencyId should be INR' })
        }
        if(!(currencyformat == "₹")){
            return res.status(400).send({status:false , message: "currencyformat should be Ruppee"})
        }
        //========================================== validations for installments ================================================ 
        if (installments) {
            if (!validInstallment(installments)) {
                return res.status(400).send({ status: false, message: "installments can't be a decimal number & must be greater than equalto zero " })
            }
        }

        //========================================== validations for file upload ================================================ 
        let productImage = req.files;
        if (!(productImage && productImage.length > 0)) {
            return res.status(400).send({ status: false, msg: "product image is required" });
        }

        let productImageUrl = await uploadFile(productImage[0]);



        //==========================================  structuring the data ================================================ 

        const newProductData = {

            title,
            description,
            price,
            currencyId,
            currencyFormat: currencySymbol(currencyId),
            availableSizes,
            isFreeShipping,
            style,
            installments,
            productImage: productImageUrl
        }

        //================================================= validations for availableSizes=====================================
        if (!validString(availableSizes)) {
            return res.status(400).send({ status: false, message: 'available Sizes is required' })
        }

        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, message: `Available Sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }

            }

            if (Array.isArray(array)) {
                newProductData['availableSizes'] = array
            }
        }

        //======================================================= creating new product data ==============================

        const saveProductDetails = await productModel.create(newProductData)
        res.status(201).send({ status: true, message: "Product Successfully Created", data: saveProductDetails })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}














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

module.exports ={createProduct,cartCreation}