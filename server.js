/********************************************************************************* *
 *  WEB322 – Assignment 02 
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 *  * of this assignment has been copied manually or electronically from any other source 
 * * (including 3rd party web sites) or distributed to other students. * 
 * * Name: ___Chirag___________________ Student ID: ___151972205___________ Date: ____6/02/2022____________ *
 *  * Online (Heroku) Link: ________________________________________________________ 
 * * ********************************************************************************/


var express = require('express')
var data = require('./blog-service')
var app = express()
const fs = require('fs');
require('dotenv').config();
const bodyparser = require('body-parser');
const cors = require('cors');



var PORT = process.env.PORT || 8080

app.use(express.static('public'))
app.use(bodyparser.json());
app.use(cors());


app.get('/', (req, res) => {
    console.log(req)
    res.redirect('/about')
})

app.get('/about', (req, res) => {

    res.sendFile('./views/about.html', { root: __dirname });
})

app.get('/blog', (req, res) => {

    data.getPublishedPosts().then(function(data) {
            res.send(data)
        })
        .catch(function(err) {
            console.log(err)
        })
})

app.get('/posts', (req, res) => {
    data.getallPosts().then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log("Can not Fetch Data");
        })
});


app.get('/categories', (req, res) => {
    data.getCategories().then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log("Can not Fetch Data");
        })
})

app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.sendFile('./views/pageNotFound.html', { root: __dirname });
        return;
    }
});

data.initialize().then(() => {
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`)
        })
    })
    .catch(err => { console.log("Can not start App") })


// app.listen(PORT, () => {
//     console.log(`Express application is listening on port ${PORT}`)
// })

//module.exports = app;