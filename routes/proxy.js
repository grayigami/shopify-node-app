/**
 * ./routes/proxy.js
 * This is where you'll set up anything to do with your app proxy if you have one set up.
 */
const express = require('express');
const Shopify = require('shopify-api-node');
const config = require('../config');
const router = express.Router();
const request = require('request-promise');

const shopAPI = new Shopify({
      shopName: 'flamingo-sheet-music-co',
      accessToken: '6c02c041eb39c8fc1b1a51c2bef9558a'
    });
//router.get("*", function(request, response){
//    console.log(request.headers.host + request.url);
//    response.redirect("https://" + request.headers.host + request.url);
//});
// Send everything from this route back as liquid.
router.use((req, res, next) => {
  res.set('Content-Type', 'application/liquid');
  next();
});

router.get('/', (req, res, next) => {
    console.log(res.getHeaders());
    res.render('index', {title: 'Flamingo Web Kit'});
});

router.get('/order', (req, res, next) => {
    let data = req.query;

    const orderId = query.order-id;
    
});

router.get('/vendor', (req, res, next) => {
    const params = req.query;
    const customerId = params.customer;
    shopAPI.customer.get(customerId).then(function(customer) {
        shopAPI.metafield.list({metafield: {
            owner_resource: 'customer', 
            owner_id: customerId 
        }}).then(async metafields => {
            let vendorProd = [];
            await metafields.forEach(metafield => {
                vendorProd.push(metafield.value);
            });
            console.log(vendorProd.join(','));
            if(vendorProd[0] != null) {
                let url = 'https://' + 'flamingo-sheet-music-co.myshopify.com' + '/admin/products.json?ids='+vendorProd.toString();
                console.log(url);
                console.log(vendorProd);
                let options = {
                    method: 'GET',
                    uri: url,
                    json: true,
                    headers: {
                        'X-Shopify-Access-Token': '6c02c041eb39c8fc1b1a51c2bef9558a',
                        'content-type': 'application/json'
                    }
                };

                request(options).then(product => {
                    shopAPI.order.list({status: 'any'}).then(order => {
                        product.products.forEach(productOrder => {
                            productOrder.productCount = 0;
                        });
                        
                        product.products.forEach(productProd => {
                            order.forEach(order => {    
                                    order.line_items.forEach(orderProduct => {
                                    if(productProd.id == orderProduct.product_id) {
                                        productProd.productCount++;
                                        console.log(productProd.productCount);
                                    }
                                });
                            });
                        });

                        res.render('vendor/vendor', {customer: customer, product: product.products});
                    })
                });
            } else {
                res.render('vendor/vendor', {customer: customer});
            }
            
        });
    });
});

module.exports = router;
