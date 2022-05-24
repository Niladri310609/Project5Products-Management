const validation = require('../validation/validation')
const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const {uploadFile} =require('../controllers/awsUpload')
const jwt= require('jsonwebtoken');
//==================================================loginuser===========================================
const loginUser = async (req, res) => {

    try {
        const requestBody = req.body;

        // Extract params

        const { email, password } = requestBody;

        // Validation starts

        if (!validation.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }

        if (!validation.isValid(email)) {
            res.status(400).send({ status: false, msg: "Enter an email" });
            return;
        }
       
        /*if (!validation.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }*/

        if (!validation.isValid(password)) {
            res.status(400).send({ status: false, msg: "enter a password" });
            return;
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
        }
        // Validation ends
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ status: false, message: `Invalid login credentials` });
        }

        let hashedPassword = user.password

        const checkPassword = await bcrypt.compare(password, hashedPassword)

        if (!checkPassword) return res.status(401).send({ status: false, message: `Invalid login credentials` });

        const token = jwt.sign({
            userId: user._id,
            iat: Math.floor(Date.now() / 1000),   
            exp: Math.floor(Date.now() / 1000) + 20 * 60 * 60
        }, 'Hercules')


        res.header("Authorization", "Bearer");

        res.status(200).send({ status: true, msg: "successful login", data: { userId: user._id, token: token } });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, msg: error.message });
    }
}


//..............................................................














//=====================================update User ============================================
const updateUser = async (req, res) => {

    try {
        let files = req.files
        let requestBody = req.body
        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!validation.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })

        }
        if (!validation.isValidObjectId(userIdFromToken)) {
            return res.status(400).send({ status: false, message: `Unauthorized access! User's info doesn't match ` })
        }
        const findUserProfile = await userModel.findOne({ _id: userId })
        if (!findUserProfile) {
            return res.status(400).send({
                status: false,
                message: `User doesn't exists by ${userId}`
            })
        }
        if (findUserProfile._id.toString() != userIdFromToken) {
            return res.status(401).send({ status: false, message: `Unauthorized access! User's info doesn't match` });
            
        }

        let { fname, lname, email, phone, password, address } = requestBody;


        if (!validation.validString(fname)) {
            return res.status(400).send({ status: false, message: 'fname is Required' })
        }
        if (fname) {
            if (!validation.isValid(fname)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide fname" })
            }
        }
        if (!validation.validString(lname)) {
            return res.status(400).send({ status: false, message: 'lname is Required' })
        }
        if (lname) {
            if (!validation.isValid(lname)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide lname" })
            }
        }
        if (!validation.validString(email)) {
            return res.status(400).send({ status: false, message: 'email is Required' })
        }
        if (email) {
            if (!validation.isValid(email)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" })
            }
            if (!validation.isValidEmail(email)) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` });
            }
            let isEmailAlredyPresent = await userModel.findOne({ email: email })
            if (isEmailAlredyPresent) {
                return res.status(400).send({ status: false, message: `Unable to update email. ${email} is already registered.` });
            }
        }
        if (!validation.validString(phone)) {
            return res.status(400).send({ status: false, message: 'phone number is Required' })
        }
        if (phone) {
            if (!validation.isValid(phone)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone number." })
            }
            if (!validation.isValidPhone(phone)) {
                return res.status(400).send({ status: false, message: `Please enter a valid phone number.` });
            }
            let isPhoneAlredyPresent = await userModel.findOne({ phone: phone })
            if (isPhoneAlredyPresent) {
                return res.status(400).send({ status: false, message: `Unable to update phone. ${phone} is already registered.` });
            }
        }
        if (!validation.validString(password)) {
            return res.status(400).send({ status: false, message: 'password is Required' })
        }
        let tempPassword = password
        if (tempPassword) {
            if (!validation.isValid(tempPassword)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide password" })
            }
            if (!validation.isValidPassword(tempPassword)){
                return res.status(400).send({ status: false, message: "Your password must contain atleast one number,uppercase,lowercase and special character[ @ $ ! % * ? & ] and length should be min of 8-15 charachaters" })
            }
            var encryptedPassword = await bcrypt.hash(tempPassword,saltRounds)
        }

        if (address) {

            let shippingAddressToString = JSON.stringify(address)
            let parsedShippingAddress = JSON.parse(shippingAddressToString)

            if (validation.isValidRequestBody(parsedShippingAddress)) {
                if (parsedShippingAddress.hasOwnProperty('shipping')) {
                    if (parsedShippingAddress.shipping.hasOwnProperty('street')) {
                        if (!validation.isValid(parsedShippingAddress.shipping.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's Street" });
                        }
                    }
                    if (parsedShippingAddress.shipping.hasOwnProperty('city')) {
                        if (!validation.isValid(parsedShippingAddress.shipping.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's City" });
                        }
                    }
                    if (parsedShippingAddress.shipping.hasOwnProperty('pincode')) {
                        if (!validation.isValid(parsedShippingAddress.shipping.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide shipping address's pincode" });
                        }
                    }
                    var shippingStreet = address.shipping.street
                    var shippingCity = address.shipping.city
                    var shippingPincode = address.shipping.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters. Shipping address cannot be empty" });
            }
        }
        if (address) {

            let billingAddressToString = JSON.stringify(address)
            let parsedBillingAddress = JSON.parse(billingAddressToString)

            if (validation.isValidRequestBody(parsedBillingAddress)) {
                if (parsedBillingAddress.hasOwnProperty('billing')) {
                    if (parsedBillingAddress.billing.hasOwnProperty('street')) {
                        if (!validation.isValid(parsedBillingAddress.billing.street)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's Street" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('city')) {
                        if (!validation.isValid(parsedBillingAddress.billing.city)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's City" });
                        }
                    }
                    if (parsedBillingAddress.billing.hasOwnProperty('pincode')) {
                        if (!validation.isValid(parsedBillingAddress.billing.pincode)) {
                            return res.status(400).send({ status: false, message: " Invalid request parameters. Please provide billing address's pincode" });
                        }
                    }
                    var billingStreet = address.billing.street
                    var billingCity = address.billing.city
                    var billingPincode = address.billing.pincode
                }
            } else {
                return res.status(400).send({ status: false, message: " Invalid request parameters. Billing address cannot be empty" });
            }
        }
        if (files) {
            if (validation.isValidRequestBody(files)) {
                if (!(files && files.length > 0)) {
                    return res.status(400).send({ status: false, message: "Invalid request parameter, please provide profile image" })
                }
                var updatedProfileImage = await uploadFile(files[0])
            }
        }


        let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
            $set: {
                fname: fname,
                lname: lname,
                email: email,
                profileImage: updatedProfileImage,
                phone: phone,
                password: encryptedPassword,
                'address.shipping.street': shippingStreet,
                'address.shipping.city': shippingCity,
                'address.shipping.pincode': shippingPincode,
                'address.billing.street': billingStreet,
                'address.billing.city': billingCity,
                'address.billing.pincode': billingPincode
            }
        }, { new: true })
        return res.status(200).send({ status: true, data: changeProfileDetails })
    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};


module.exports = {updateUser,loginUser}