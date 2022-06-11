/********************************************************************************* *
 *  WEB322 – Assignment 03
 * * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 *  * of this assignment has been copied manually or electronically from any other source 
 * * (including 3rd party web sites) or distributed to other students. * 
 * 
 * 
 * * Name: ___Chirag__ Student ID: ___151972205____ Date: ____12/02/2022__ *
 *  * Online (Heroku) Link: https://chirag-web322-ass3.herokuapp.com *  
 *  * ********************************************************************************/


var express = require('express')
var data = require('./blog-service')
var app = express()
const fs = require('fs');
require('dotenv').config();
const bodyparser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'c4-cloud',
    api_key: '262414272632982',
    api_secret: 'n9vpr8G3W18M4JpEXLVXRULaONY',
    secure: true
});

const upload = multer();
var PORT = process.env.PORT || 8080

app.use(express.static('public'))
app.use(bodyparser.json());
app.use(cors());

// default start view 
app.get('/', (req, res) => {
    console.log(req)
    res.redirect('/about')
})

// About page view route 
app.get('/about', (req, res) => {

    res.sendFile('./views/about.html', { root: __dirname });
})

// published Posts route 
app.get('/blog', (req, res) => {

    data.getPublishedPosts().then(function(data) {
            res.send(data)
        })
        .catch(function(err) {
            console.log(err)
        })
})

// get posts route 
app.get('/posts', (req, res) => {
    let queryPromise = null;

    // by category query 
    if (req.query.category) {
        queryPromise = data.getPostsByCategory(req.query.category);
        // by mindate Query 
    } else if (req.query.minDate) {
        queryPromise = data.getPostsByMinDate(req.query.minDate);
        //all posts 
    } else {
        queryPromise = data.getallPosts()
    }

    queryPromise.then(data => {
        res.send(data)
    }).catch(err => {
        res.render("No Posts Returned 1");
    })
});

// Get All categories Route 
app.get('/categories', (req, res) => {
    data.getCategories().then(data => {
            res.send(data);
        })
        .catch(err => {
            console.log("Can not Fetch Data");
        })
})

// Add posts view 
app.get('/posts/add', (req, res) => {
    res.sendFile('./views/addPost.html', { root: __dirname });

})

// get post by ID 
app.get('/posts/:id', (req, res) => {
    data.getPostById(req.params.id).then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send("No Result with Id exists");
    })
});

// Add post route

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };

    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts

        var postData = req.body;
        data.addPost(postData).then(data => {
            res.redirect('/posts');
        }).catch(err => {
            res.send(err);
        });

    });

});


// page not found middleware 
app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.sendFile('./views/pageNotFound.html', { root: __dirname });
        return;
    }
});

// initilize the App 
data.initialize().then(() => {
        app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`)
        })
    })
    .catch(err => { console.log("Can not start App") });