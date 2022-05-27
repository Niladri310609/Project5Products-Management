const aws = require("aws-sdk");
const productModel = require('../models/productModel')
const { isValid, isValidRequestBody, isValidObjectId,isValidNumber, validString,validInstallment } = require('../validation/validation')
const { uploadFile } = require('../controllers/awsUpload')
const currencySymbol = require("currency-symbol-map")


//================================================Create Product=====================

const createProduct = async (req, res) => {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid params received in request body' })
        }
        if (requestBody.isDeleted && requestBody.isDeleted != "false") {
            return res.status(400).send({ status: false, data: "isDeleted must be false" })
        }


        const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const isTitleAlreadyUsed = await productModel.findOne({ title });

        if (isTitleAlreadyUsed) {
            return res.status(400).send({ status: false, message: 'Title is already used.' })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: 'Description is required' })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: 'Price is required' })
        }

        if (!(!isNaN(Number(price)))) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` })
        }
        if (price <= 0) {
            return res.status(400).send({ status: false, message: `Price cannot be Zero` })
        }

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: 'CurrencyId is required' })
        }

        if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: 'currencyId should be INR' })
        }

        if (installments) {
            if (!validInstallment(installments)) {
                return res.status(400).send({ status: false, message: "installments can't be a decimal number & must be greater than equalto zero " })
            }
        }

        if (isValid(isFreeShipping)) {

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping must be a boolean value' })
            }
        }

        let productImage = req.files;
        if (!(productImage && productImage.length > 0)) {
            return res.status(400).send({ status: false, msg: "productImage is required" });
        }

        let productImageUrl = await uploadFile(productImage[0]);

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

        if (!isValid(availableSizes)) {
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

        const saveProductDetails = await productModel.create(newProductData)
        res.status(201).send({ status: true, message: "Product Successfully Created", data: saveProductDetails })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error });
    }
}
//======================================================= get Product by Filter ==============================





const getProduct = async function (req, res) {

    try {

        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
        let data = req.query

        if (data.isDeleted && data.isDeleted != "false") {
            return res.status(400).send({ status: false, data: "isDeleted must be false" })
        }

        const value = [size, name, priceGreaterThan, priceLessThan, priceSort]
        const valueString = ["size", "name", "priceGreaterThan", "priceLessThan", "priceSort"]

        for (let i = 0; i < value.length; i++) {
            let key = `${value[i]}`
            if (key == '' || key =={}) {
                return res.status(400).send({ status: false, data: `${valueString[i]} can not be empty` })
            }
        }
       
        const filter = {}

        if (size) {
            size = size.trim().toUpperCase()

            const availableSizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]

            const sizeFromAvailableSizes = availableSizes.includes(size) //Give true or false

            if (!sizeFromAvailableSizes) {
                return res.status(400).send({ status: false, data: `choose one the size from S,XS,M,X,L,XXL,XL ` })
            }
            filter.availableSizes = size
        }

        if (name) {
            name = name.trim()

            if (!isValid(name)) {

                return res.status(400).send({ status: false, data: "name must be a valid string" })
            }
            filter.title = { $regex: name, $options: 'i' }
        }

        if (priceGreaterThan) {

            priceGreaterThan = priceGreaterThan.trim()

            if (!isValidNumber(priceGreaterThan)) {
                return res.status(400).send({ status: false, data: "Price greater than must have valid Numbers" })
            }
            filter.price = { $gt: priceGreaterThan }
        }

        if (priceLessThan) {
            priceLessThan = priceLessThan.trim()

            if (!isValidNumber(priceLessThan)) {
                return res.status(400).send({ status: false, data: "Price less than must have valid Numbers" })
            }
            filter.price = { $lt: priceLessThan }
        }

        if (priceGreaterThan && priceLessThan) {

            priceGreaterThan = priceGreaterThan.trim()

            priceLessThan = priceLessThan.trim()

            let priceRange = [priceGreaterThan, priceLessThan]

            for (let i = 0; i < priceRange.length; i++) {

                if (!isValidNumber(priceRange[i])) {
                    return res.status(400).send({ status: false, data: "Price range must have valid Numbers" })
                }
            }
            filter.price = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        filter.isDeleted = false;

        if (priceSort) {
            priceSort = priceSort.trim()
            if (!(priceSort == '-1' || priceSort == '1')) {
                return res.status(400).send({ status: false, data: `value of priceSort must be 1 or -1 ` })
            }
        }
        else {
            priceSort = 1
        }

        console.log(filter)
        const getData = await productModel.find(filter).sort({ price: priceSort })

        if (getData.length == 0) {

            return res.status(404).send({ status: false, message: "Product not found" })
        }
        return res.status(200).send({ status: true, data: getData })
    }
    catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }

}
//============================================================== getProductById ==============================================================



const getProductById  = async (req, res) => {

    try {
        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: "Invalid Product Id" })
        }

        let findProducts = await productModel.findOne({ _id: productId, isDeleted: false }).lean()

        if (!findProducts) {
            return res.status(404).send({ status: false, message: "Product not found" })
        }

        return res.status(200).send({ status: true, message: "Success", data: findProducts })


    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}



//================================================== update Product =============================================================


const updateProduct = async function (req, res) {
    try {
        let requestBody = req.body
        let files = req.files
        let productId = req.params.productId
    //========================================== validations for ObjectId ================================================
        if (!isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: `${productId} is not a valid product id` })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) {
            return res.status(404).send({ status: false, message: `product not found` })
        }
        if (requestBody.isDeleted && requestBody.isDeleted != "false") {
            return res.status(400).send({ status: false, data: "isDeleted must be false" })
        }
    //=============================================== input Body validations ================================================

        if (!(isValidRequestBody(requestBody) && files)) {
            return res.status(400).send({ status: false, message: 'Please Input data for Updation' })
        }
    //==============================================================================destructuring================================================
        const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = requestBody;

        const updatedProductDetails = {}  // considering a empty object


        if (fname == "") {
            return res.status(400).send({ status: false, message: "fname cannot be empty" })
        }

        if (fname && !validString(fname)) {
            return res.status(400).send({ status: false, message: 'fname is Required' })
        }
        if (fname) {
            if (!isValid(fname)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide fname" })
            }
        }

             isTitleAlreadyUsed = await productModel.findOne({ title, _id: { $ne: productId } });
           
            if (isTitleAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${title} title is already used` })
            }

            if (!updatedProductDetails.hasOwnProperty('title'))
                updatedProductDetails['title'] = title
        
        if(description=="")return res.status(400).send({status:false , message: "description field cannot be empty"})
        if (isValid(description)) {
            if (!updatedProductDetails.hasOwnProperty('description'))
                updatedProductDetails['description'] = description
        }
        if(price == "")return res.status(400).send({status:false , message: "Price field cannot be empty"})
        if (isValid(price)) {

            if (!(!isNaN(Number(price)))) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }

            if (price <= 0) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }

            if (!updatedProductDetails.hasOwnProperty('price'))
                updatedProductDetails['price'] = price
        }

      
        if (isValid(currencyId)) {

            if (!(currencyId == "INR")) {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }

            if (!updatedProductDetails.hasOwnProperty('currencyId'))
                updatedProductDetails['currencyId'] = currencyId;

        }


        if (isValid(isFreeShipping)) {

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }

            if (!updatedProductDetails.hasOwnProperty('isFreeShipping'))
                updatedProductDetails['isFreeShipping'] = isFreeShipping
        }

        let productImage = req.files;
        if ((productImage && productImage.length > 0)) {

            let updatedproductImage = await uploadFile(productImage[0]);

            if (!updatedProductDetails.hasOwnProperty('productImage'))
                updatedProductDetails['productImage'] = updatedproductImage
        }

        if (isValid(style)) {

            if (!updatedProductDetails.hasOwnProperty('style'))
                updatedProductDetails['style'] = style
        }

        if (availableSizes) {

            let sizesArray = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < sizesArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizesArray[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }
            if (!updatedProductDetails.hasOwnProperty(updatedProductDetails, '$set'))
                updatedProductDetails['$set'] = {}
            updatedProductDetails['$set']['availableSizes'] = sizesArray//{ $set: sizesArray }
        }


        if (installments) {
            if (!validInstallment(installments)) {
                return res.status(400).send({ status: false, message: "installments can't be a decimal number & must be greater than equalto zero " })
            }
            if (!updatedProductDetails.hasOwnProperty('installments'))
                updatedProductDetails['installments'] = installments
        }
            
                const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updatedProductDetails, { new: true })

        return res.status(200).send({ status: true, message: 'Successfully updated product details.', data: updatedProduct });
    } catch (err) {

        return res.status(500).send({
            status: false,
            message: err.message
        })
    }
}
//=====================================================================deleteProductById===============================

const deleteProductById = async (req, res) => {

    try {

        let productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: "Invalid Product Id" })
        }
        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!checkProduct ) {
            return res.status(404).send({ status: false, message: "Product doesn't exits" })
        }

        let deletedProduct =  await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } },{new:true})

        return res.status(200).send({ status: true, message: "Product Deleted Succesfully",data:deletedProduct})

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports ={createProduct,updateProduct,getProduct,getProductById,deleteProductById}