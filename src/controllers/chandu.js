const mongoose = require('mongoose')
const aws = require('../controllers/awsUpload')
const productModel = require('../models/productModel')
const validator = require('../validation/validation')



const produtCreate = async (req, res) => {

    let prouductImage = req.files

    let data = req.body
    //----------------body validation-------
    if (!validator.isValidRequestBody) return res.status(400).send({ status: false, message: 'give the product details' })
    //------------------------------------------------
    let datas = JSON.parse(data.data)

    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = datas
    console.log(availableSizes)

    //-----------mandidatory arrys--------------    
    let arr1 = ["title", "description", "price", "currencyId", "currencyFormat"]
  
    let arr = [title, description, price, currencyId, currencyFormat]
    //-------------------------------------------
    //------------------unique arrays----------------------
    let uniqueKey = ["title"]
    
    let uniqueArrayKeyPair = [{ title: '' }] //this for dynamic message
    
    let uniqueArrayValue = [title] //this array is for storing all unique propertys in model
    //----------------------------------------------------

    //other than inr validation
    //enum validation
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

    const isValidCurrn = function (title) {
        return ["INR"].indexOf(title) !== -1;
    };

    //--------undefined function-----------
    castings = () => undefined
    
    //-----mandidatory feilds validation----------
    for (let i = 0; i < arr.length; i++) {
        
        let key = `${arr[i]}`
      
        if (key == 'undefined') key = castings()
      
        if (!validator.isValid(key)) return res.status(400).send({ status: false, message: `please enter the ${arr1[i]}` })
    }
    //---------------------------------------
   
    if (!isValidCurrn(currencyId)) return res.status(400).send({ status: false, message: `the currencyId should be INR` })
    
    if (currencyFormat != '₹') return res.status(400).send({ statu: false, message: `cunnrenty fomat is invalid ` })

    //-------------------unique validation---------------
    for (let i = 0; i < uniqueArrayValue.length; i++) {
       
        let key = uniqueArrayValue[i]
        // uniqueArrayValue[i][key]=key
      
        uniqueArrayKeyPair[i].title = key
      
        console.log(uniqueArrayKeyPair[i])
      
        let valueExsits = await productModel.findOne(uniqueArrayKeyPair[i])
      
        console.log((valueExsits))
      
        if (valueExsits) return res.status(400).send({ status: false, message: `This ${uniqueKey[i]} already registerd in the data base` })
    }
    //---------------------------------------------------

  
    let imageLink = await aws.uploadFile(prouductImage[0])
  
    let finalData = { ...datas, productImage: imageLink }
  
    let product = await productModel.create(finalData)
  
    res.status(200).send(product)
}
module.exports = { produtCreate}