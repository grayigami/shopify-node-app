/**
 * ./routes/proxy.js
 * This is where you'll set up anything to do with your app proxy if you have one set up.
 */
const express = require('express');
const Shopify = require('shopify-api-node');
const downloader = require('fs');
const config = require('../config');
const router = express.Router();
const request = require('request-promise');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({projectId: 'excellent-zoo-236414'});
const zipBucket = require('zip-bucket')(storage);

const shopAPI = new Shopify({
      shopName: 'flamingo-sheet-music-co',
      accessToken: '6c02c041eb39c8fc1b1a51c2bef9558a'
    });

router.use((req, res, next) => {
  res.set('Content-Type', 'application/liquid');
  next();
});

router.get('/', (req, res, next) => {
    const params = req.query;
    const customerId = params.customer;
    console.log(customerId);

    shopAPI.customer.orders(customerId, {fields: 'line_items', status: 'any'}).then(result => {
        var items = result
        var productIds = [];
        items.forEach(product => {
           var line_items = product.line_items;
           line_items.forEach(obj => {
               if(obj.product_id != null) {
               productIds.push(obj.product_id);
               }
           });
        });
        console.log(productIds.join(','));
        console.log(productIds.toString());
        //shopAPI.product.get('',{ids: productIds}).then(product => {
        //    product.forEach(object => {
         //       console.log(object.handle);
         //   });
         //   res.render('index');
       // });

        let url = 'https://' + 'flamingo-sheet-music-co.myshopify.com' + '/admin/products.json?ids='+productIds.toString();
        console.log(url);
    let options = {
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            'X-Shopify-Access-Token': '6c02c041eb39c8fc1b1a51c2bef9558a',
            'content-type': 'application/json'
        }
    };

    request(options)
        .then(function (parsedBody) {
            console.log(parsedBody.products);
            
                res.render('downloads', {product: parsedBody.products});
        });
        
    });
    

        
    
    console.log("Order Stuff?");
   // console.log(orderStuff);
    //Promise.all([customerStuff, orderStuff]).then(data => {
     //   var customerProducts = [];
        
     //       customerProducts = (data[1].then(orders => {
     //           return orders.lineitems;
     //       }));
       // var orders = data[1].orders;
      //  console.log(customerProducts);
     //   res.set('Content-Type', 'application/liquid');
     //   res.render('downloads', {customer: data[0].customer, customerProd: customerProducts});
     //   }, function(err) {
     //   console.log(err);
     //   });
        
});
router.get('/product', (req, res, next) => {
    const rando = Math.floor((Math.random() +1) * 999);
    zipBucket({fromBucket: 'penguinwebkit', fromPath: 'products/'+req.query.product, toBucket: 'penguinwebkit', toPath: 'downloads/'+req.query.product+rando+'.zip'}).then(() => {
        res.redirect('https://storage.googleapis.com/penguinwebkit/downloads/'+req.query.product+rando+'.zip');
    });
    //var Storage = new storage();
    //storage.bucket('penguinwebkit').file('downloads/'+req.query.product+'.zip').download();
});
        
        //console.log(customer);
    

module.exports = router;
