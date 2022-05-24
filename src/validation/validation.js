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
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
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

module.exports={isValid,isValidRequestBody,isValidObjectId,isValidEmail,isValidPhone,isValidPassword,validString}