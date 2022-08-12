const express = require('express');
const bodyParser = require('body-parser');
var multer = require('multer') // HERE
const route = require('./routes/routes.js');
const { AppConfig } = require('aws-sdk')
const app = express();
const jwt= require('jsonwebtoken');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any()) // HERE
const mongoose = require('mongoose')



mongoose.connect("mongodb+srv://REYNIL310609:OnIYmcfVuOkV0Dkr@cluster0.csvzw.mongodb.net/Project5Group2Database?retryWrites=true&w=majority", 
{ useNewUrlParser: true })
    .then(() => console.log('mongodb Rock n Roll on 3000'))
    .catch(err => console.log(err))
   

app.use('/', route);      


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});