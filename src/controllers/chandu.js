const mongoose = require('mongoose')
const aws = require('../controllers/awsUpload')
const productModel = require('../models/productModel')
const { isValid, isValidRequestBody,isValidObjectId,validQuantity} = require('../validation/validation')
const userModel = require('../models/userModel')
const cartModel = require('../models/cartModel')



const produtCreate = async (req, res) => {
    try{

    let prouductImage = req.files

    let data = req.body
    //----------------body validation-------
    if (!isValidRequestBody) return res.status(400).send({ status: false, message: 'give the product details' })
    //------------------------------------------------
    let datas = JSON.parse(data.data)


    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style,  installments } = datas
    // console.log(typeof(availableSizes))

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
   
    const splitingString = (Arr) => {
                   
             console.log(Arr)
            let brr = Arr?.split(',')
            
            return brr
        }
      
        let availableSizes=splitingString(datas.availableSizes)
        console.log(availableSizes)
    if(!availableSizes) return res.status(400).send({status:false,message:`availablesSIzes must be at least  one of this sizes "S, XS, M, X, L,XXL, XL`})  
    if (datas.availableSizes) {
           for (let i = 0; i < availableSizes.length; i++) {
               
                let arrEle=availableSizes[i]
                
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(arrEle))) return res.status(400).send({ status: false, message: `Available Sizes must be among ["S", "XS", "M", "X", "L", "XXL", "XL"]` })
                         
            }
        }
    const isValidCurrn =  (title)=> ["INR"].indexOf(title) !== -1;
    //--------undefined function-----------
    castings = () => undefined
    
    //-----mandidatory feilds validation----------
    for (let i = 0; i < arr.length; i++) {
        
        let key = `${arr[i]}`
      
        if (key == 'undefined') key = castings()
      
        if (!isValid(key)) return res.status(400).send({ status: false, message: `please enter the ${arr1[i]}` })
    }
    //---------------------------------------
    
    if(isValidNumber(title))  return res.status(400).send({ status: false, message: `the title can't be only number` })
    
    if(isValidNumber(description))  return res.status(400).send({ status: false, message: `the title can't be only number` })
    
    if(isValidNumber(style))  return res.status(400).send({ status: false, message: `the title can't be only number` })
    
    if(!isValidNumber(price))  return res.status(400).send({ status: false, message: `the price must be number` })
    
    if(!isValidNumber(installments))  return res.status(400).send({ status: false, message: `the  instalment must be number` })
    
    if(installments<0)   return res.status(400).send({ status: false, message: `the installment can't be less than zero` })
    
    if(price<0)   return res.status(400).send({ status: false, message: `the price can't be less than zero` })
    
    if(!(typeof(isFreeShipping)==="boolean")) return res.status(400).send({ status: false, message: `isFreeShipping property must be true or false` })
    
    if (!isValidCurrn(currencyId)) return res.status(400).send({ status: false, message: `the currencyId should be INR` })
    
    if (currencyFormat != '₹') return res.status(400).send({ statu: false, message: `cunnrenty fomat is invalid ` })

    //-------------------unique validation---------------
    for (let i = 0; i < uniqueArrayValue.length; i++) {
       
        let key = uniqueArrayValue[i]
        
        uniqueArrayKeyPair[i].title = key
      
        let valueExsits = await productModel.findOne(uniqueArrayKeyPair[i])
      
        if (valueExsits) return res.status(400).send({ status: false, message: `This ${uniqueKey[i]} already registerd in the data base` })
    }
    //---------------------------------------------------

  
    let imageLink = await aws.uploadFile(prouductImage[0])
  
    let finalData = { ...datas,availableSizes:splitingString(datas.availableSizes), productImage: imageLink }
  
    let product = await productModel.create(finalData)
    
    res.status(200).send(product)
}
catch(e){
res.status(500).send({ status: false, message: e.message })
}
}
//====================================================================================== Cart Creation =========================
const createCart = async (req, res) => {
    try {
        const data = req.body   
        
        let userId = req.params.userId
        
        userId=userId.toString().trim()

        let  {productId, cartId } = data
        
        productId=productId.toString().trim()
        
    
        if (!(isValidRequestBody(data))) return res.status(400).send({ status: false, message: `please provid body data` })

       

        if (!isValid(productId)) return res.status(400).send({ status: false, message: `please enter the product ID` })
         if(cartId) {
        
         cartId=cartId.toString().trim()
        
         if (!isValid(cartId)) return res.status(400).send({ status: false, message: `please enter the cart ID` })
        
         if(!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: `Cart ID is not valid ` })
         }

        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: `please enter the valid product Id` })

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: ` please enter the valid user Id` })

        let userExsists = await userModel.findById(userId)

        if (!userExsists) return res.status(400).send({ status: false, message: ` user don't exsist in data base` })
        
        let productExsists = await productModel.find({ _id: productId, isDeleted: false })
        
        if ((productExsists.length == 0)) return res.status(400).send({ status: false, message: ` product  don't exsist in data base` })

        let prices = productExsists[0].price
    
        let cartExists = await cartModel.findOne({ userId: userId})
         console.log(cartExists)
        
    
        if (cartExists) {

             let cartExists1 = await cartModel.findOne({ userId: userId,_id:cartId})
            
             if (!cartId) return res.status(400).send({ status: false, message: ` cart Id is has been genrated already please enter the cart Id` })

            if(!cartExists1) return res.status(400).send({ status: false, message: ` cart ID cart is not mathced with this user ID` })
    
    
            if(cartId) 
            {

                const ifSameProduct = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: userId }, { $inc: { "items.$.quantity": 1,totalPrice: prices } }, { new: true })

                console.log(ifSameProduct)
                
                if(ifSameProduct) return res.status(200).send({status:false,message:'product added',Data:ifSameProduct})

                let newItems={
                    productId:productId,
                    quantity:1
                }

                let addingPrduct = await cartModel.findOneAndUpdate({_id:cartId,userId:userId},
                    {
                     $push: { items: newItems},
                      $inc: { totalPrice: prices, totalItems: 1  }
                     }  
              , { new: true})

                return res.status(200).send({ status: true, message: `product is added to the cart`, data: addingPrduct })
            }
        }
         let newItems1={
                    productId:productId,
                    quantity:1
                }

        let addingCartId = await cartModel.create({ items:newItems1, userId: userId, totalPrice: prices, totalItems: 1 })

        res.status(200).send({ status: true, message: `product is added to the cart`, data: { addingCartId } })
    }
    catch (e) {
        res.status(500).send({ satus: false, error: e.message })
    }
}


module.exports = { produtCreate,createCart}
