const express = require('express');
const Shopify = require('shopify-api-node');
const fs = require('fs');
const config = require('../config');
const router = express.Router();
const multer = require('multer');
const request = require('request');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(pdf|PDF|sib|midi|mid|jpg|png|gif|PNG|JPG|jpeg|JPEG)$/)) {
        return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
};
var limit = { fileSize: 12000000000 };

var m = multer({ storage: multer.memoryStorage(), limits: limit, fileFilter: imageFilter });

const shopAPI = new Shopify({
      shopName: 'flamingo-sheet-music-co',
      accessToken: '6c02c041eb39c8fc1b1a51c2bef9558a',
      autoLimit: true
});

router.use((req, res, next) => {
  res.set('Content-Type', 'application/liquid');
  next();
});

router.get('/new', (req, res, next) => {
    
    res.render('product_upload');
});
router.post('/submitted', m.any(), (req, res, next) => {
    bucket = storage.bucket('penguinwebkit')
      let promises = []
      let links = []
      req.files.forEach((file) => {
          var blob = bucket.file(file.originalname);
          if(file.fieldname == 'productImage'){
                blob = blob;
          } else {
                blob = bucket.file('products/'+ req.body.productTitle + '/' + file.originalname);
          }
        const newPromise =  new Promise((resolve, reject) => {
          blob.createWriteStream({
            metadata: { contentType: file.mimetype }
          }).on('finish', async response => {
            await blob.makePublic().then(() => {
               
            })
            await links.push(file.originalname);
            resolve(response)
          }).on('error', err => {
            reject('upload error: ', err)
          }).end(file.buffer)
        })
       promises.push(newPromise)
     })
    var productLinks = [];
    
    for(var i = 0; i < req.files.length; i++) {
        if(req.files[i].fieldname == 'productImage'){
            productLinks.push({src:'https://storage.googleapis.com/penguinwebkit/' + req.files[i].originalname});
        } else if(req.files[i].fieldname == 'productFile') {
            
        }
    }

    var data = req.body;
    var customerId = data.customer;
    var productPrice = data.productPrice;
    var productTitle = data.productTitle;
    var productDescription = data.productDescription;



    //add table to product description
    var productTags = data.productTags;
    var copyright = data.copyright;
    console.log("ok");
    let new_product = {
        product: {
            title: productTitle,
            body_html: productDescription,
            vendor: 'Flamingo Vendor', //eventually add username of vendor, mr. grayigami
            product_type: 'Digital Sheet Music',
            tags: productTags,
            images: productLinks,
            variants: [{
                price: productPrice
            }]
        }
    };
    console.log("ok2");
    shopAPI.product.create(new_product.product).then(function(product) {
        bucket = storage.bucket('penguinwebkit')
        req.files.forEach((file) => {
          var blob = bucket.file(file.originalname);
          if(file.fieldname == 'productFile'){
                blob = bucket.file('products/'+ product.handle + '/' + file.originalname);
          }
        const newPromise =  new Promise((resolve, reject) => {
          blob.createWriteStream({
            metadata: { contentType: file.mimetype }
          }).on('finish', async response => {
            await blob.makePublic().then(() => {
               
            })
            resolve(response)
          }).on('error', err => {
            reject('upload error: ', err)
          }).end(file.buffer)
        })
     })
       // shopAPI.customer.update(customerId, {metafields: {key: 'vendorProduct', value: product.id, value_type: 'integer', namespace: 'vendorProducts'}});
       
       // shopAPI.customer.update(customerId, {id: customerId, metafields: {key: 'vendorProduct', value: product.id, value_type: 'integer', namespace: 'vendorProducts'}}).then(meta => {
        //    console.log(meta);
       // });

        let url = 'https://' + 'flamingo-sheet-music-co.myshopify.com' + '/admin/customers/'+customerId+'/metafields.json';
        let options = {
            method: 'PUT', //was PUT
            uri: url,
            headers: {
                'X-Shopify-Access-Token': '6c02c041eb39c8fc1b1a51c2bef9558a',
                'content-type': 'application/json'
            },
            body: {
                metafields: {
                    key: 'vendorProduct'+product.id, 
                    value: product.id, 
                    value_type: 'integer', 
                    namespace: 'vendorProducts'
                }
            },
            json: true
        };
        
        request(options, function (parsedBody) {
            //console.log(parsedBody)
            res.render('submitThankYou', {link: product.handle});
        });

    })

});

  

module.exports = router;
