const userModel = require('../models/userModel')
const {uploadFile} =require('../controllers/awsUpload')
const bcrypt = require('bcryptjs')




const isValid = function (value) {
    if (!value || typeof value != "string" || value.trim().length == 0) return false;
    return true;
  }
  
  const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
  }
  
  const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
  }

const isValidPincode =function(pincode){
        if (!pincode || pincode.toString().trim().length == 0 || pincode.toString().trim().length != 6) return false;
        return true;
}



const createUser = async function (req, res) {
    try {

      let data = req.body
     let  data1= JSON.parse(data.data)
           
      let {  fname,lname, phone, email, password, address } = data1

      let files = req.files
       
      const phoneValidator = /^(?:(?:\+|0{0,2})91(\s*|[\-])?|[0]?)?([6789]\d{2}([ -]?)\d{3}([ -]?)\d{4})$/
  
      const emailValidator = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
  
      if (!isValidRequestBody(data1)) {
        return res.status(400).send({ status: false, message: "Body is required..." })
      }
      
      if (!files) {
        return res.status(400).send({ status: false, message: "Profile image is required..." })
      }
      if (!isValid(fname)) {
        return res.status(400).send({ status: false, message: "fname is required..." })
      }
      
      if (!isValid(lname)) {
        return res.status(400).send({ status: false, message: "lname is required..." })
      }
  
      if (!(phone)) {
        return res.status(400).send({ status: false, message: "Phone No. is required" })
      }

      if (!isValid(email)) {
        return res.status(400).send({ status: false, message: "Email is required" })
      }

      if (!isValid(password)) {
        return res.status(400).send({ status: false, message: "Password is required" })
      }

      if(!isValid(address.shipping.street)){
        return res.status(400).send({ status: false, message: "Street of shipping address is required..." })
      }

      if(!isValid(address.shipping.city)){
        return res.status(400).send({ status: false, message: "City of shipping address is required..." })
      }

      if(!isValidPincode(address.shipping.pincode)){
        return res.status(400).send({ status: false, message: "Shipping pincode must be 6 digit number" })
      }

      if(!isValid(address.billing.street)){
        return res.status(400).send({ status: false, message: "Street of billing address is required..." })
      }

      if(!isValid(address.billing.city)){
        return res.status(400).send({ status: false, message: "City of billing address is required..." })
      }

      if(!isValidPincode(address.billing.pincode)){
        return res.status(400).send({ status: false, message: "Billing pincode must be 6 digit number" })
      }

      // from db
  
      if (!phoneValidator.test(phone)) {
        return res.status(400).send({ status: false, message: "plz enter a valid Phone no" });
      }
  
      const isRegisteredphone = await userModel.findOne({ phone }).lean();
  
      if (isRegisteredphone) {
        return res.status(400).send({ status: false, message: "phoneNo. number already registered" });
      }
   
      if (!emailValidator.test(email)) {
        return res.status(400).send({ status: false, message: "plz enter a valid Email" });
      }
  
      const isRegisteredEmail = await userModel.findOne({ email }).lean();
      if (isRegisteredEmail) {
        return res.status(400).send({ status: false, message: "email id already registered" });
      }
       
      if (password.length < 8) {
        return res.status(400).send({ status: false, message: "Your password must be at least 8 characters" })
      }
      if (password.length > 15) {
        return res.status(400).send({ status: false, message: "Password cannot be more than 15 characters" })
      }

      const bcryptPassword = await bcrypt.hash(password,10)
      data1.password=bcryptPassword
      console.log(bcryptPassword)

  
      /*if (address != undefined) {
        if (address.street != undefined) {
          if (typeof address.street != 'string' || address.street.trim().length == 0) {
            return res.status(400).send({ status: false, message: "street can not be a empty string" })
          }
        }
  
        if (address.city != undefined) {
          if (typeof address.city != 'string' || address.city.trim().length == 0) {
            return res.status(400).send({ status: false, message: "city can not be a empty string" })
          }
        }
        
        if (address.pincode != undefined) {
          if (address.pincode.toString().trim().length == 0 || address.pincode.toString().trim().length != 6) {
            return res.status(400).send({ status: false, message: "Pincode can not be a empty string or must be 6 digit number " })
          }
        }
      }*/

      let uploadedFileURL = await uploadFile(files[0])

      data1.profileImage = uploadedFileURL
  
      const userCreated = await userModel.create(data1)
  
      res.status(201).send({ status: true,message:"Success" ,data: userCreated })
  
    } catch (err) {
      res.status(500).send({ status: false, error: err.message });
    }
  }
  


module.exports={createUser}









