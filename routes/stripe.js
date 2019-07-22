const express = require('express');
const Shopify = require('shopify-api-node');
const fs = require('fs');
const request = require('request')
const config = require('../config');
const router = express.Router();
const stripe = require('stripe')('sk_live_A5x9zHJdsQryzlQGh6sAWapC');

const shopAPI = new Shopify({
      shopName: 'flamingo-sheet-music-co',
      accessToken: '6c02c041eb39c8fc1b1a51c2bef9558a'
});

router.use((req, res, next) => {
  res.set('Content-Type', 'application/liquid');
  next();
});

router.get('/account', (req, res, next) => {

    let authCode = req.query.code;
    let customerId = req.query.state;
    const options = {
        method: 'POST',
        url: 'https://connect.stripe.com/oauth/token',
        headers: {
            Authorization: 'Bearer sk_live_A5x9zHJdsQryzlQGh6sAWapC'
        }, 
        body: {
            grant_type: 'authorization_code',
            client_secret: 'sk_live_A5x9zHJdsQryzlQGh6sAWapC',
            code: authCode,
        },
        json: true
    }

    request(options, function(err, res, body) {  
        console.log(res);
    });
    res.render('vendor/stripeAccount');
});


  

module.exports = router;
