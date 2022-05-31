const mongoose = require('mongoose')

//email validation
const isValidEmail = function (email) {
    const emailRegex = /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/
    return emailRegex.test(email)
}
// mobile validation
const isValidPhone = function (Phone) {
    const mobileRegex = /^[6-9]\d{9}$/
    return mobileRegex.test(Phone)
}
//validation for Value
const isValid= function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value !== 'String' && value.trim().length === 0) return false
    return true
}
//title validation
const isValidScripts= function(title){
    const scriptRegex = /^[a-zA-Z0-9 , ]{2,500}$/
    return scriptRegex.test(title)
}
    
//validation of  empty string
const validString = function (value) {
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
//validation for Request Body
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
//validation for ObjectId
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
//password validation
const isValidPassword = function (password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
    return passwordRegex.test(password)
}
const isValidPincode = function (pincode) {
  
    if(isNaN(Number(pincode.toString().trim())))return false
    if (!pincode || pincode.toString().trim().length == 0 || pincode.toString().trim().length != 6) return false;
    return true;
    
  }
  const isValidNumber=function(number){
    if(isNaN(Number(number.toString().trim()))) return false
    if(!number || number.toString().trim().length==0) return false;
    return true
}
  const validInstallment = function isInteger(value) {
    if(value < 0) return false
     if(value % 1 == 0 ) return true
}
const validQuantity = function isInteger(value) {
    if(value < 1) return false
     if(value % 1 == 0 ) return true
}
const isValidStatus = function(status) {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}


module.exports={isValid,isValidRequestBody,isValidObjectId,isValidEmail,isValidStatus, isValidScripts,isValidNumber,isValidPhone,isValidPincode,isValidPassword,validString,validInstallment,validQuantity}