// To deply
// Make sure in the kidsweb directory in terminal
// cd kidsweb
// gcloud init
// gcloud run deploy stripe-gateway --source . --allow-unauthenticated --region=us-central1
// example of what to post in a variable called field
//var fff =
/*
  [ 
    {"currency":"USD","price":"101", "recurring":"true", "productId":"productid","name":"abc","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/663333ea885f3eb487548d4f_P1000662.jpg","customText":"test"},
    {"currency":"USD","price":"102", "recurring":"false", "productId":"productid2","name":"dfg","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/65af1d4aca5b5bb61190c1df_30d977_e04ff02f9d4f4ab58c587cc96a0eba6b~mv2.webp","customText":"test"},
    {"currency":"USD","price":"103", "recurring":"false", "productId":"productid3","name":"hij","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/6632eec9927ca2f3a3a5d5bd_30d977_2836062d6fef41aa9b3e8171487681bd~mv2.webp","customText":"test"} 
  ]
*/

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors') //- this makes it fail to deploy
app.use(cors()) // this makes it fail to deploy
app.use(bodyParser.json());


const stripe = require('stripe')('sk_test_SazNAYEEQrI4wmv9n1t61tQW');

let corsOptions = { 
  origin : ['http://kidsim.webflow.io','http://staging.kidsim.org'], 
}

//app.use(express.json());
// Using express.urlencoded middleware
app.use(express.urlencoded({
    extended: true
}))

app.use('/public',express.static(__dirname + '/public'));

// https://8080-cs-395420509800-default.cs-asia-east1-vger.cloudshell.dev/checkout?testmode=true&price=34.65&currency=USD&recurring=Monthly&productId=myproduct&productName=Hope%20Alive%20Clinic&productDesc=%0AFree%20clinic%20providing%20pregnancy%20and%20pos...%20(read%20more)%20&productImage=https%3A%2F%2Fassets-global.website-files.com%2F6460f65426be97bcff8a40bd%2F664c4f5f037014e6aede110b_65b73c8200ab2b916337617f_feet-p-500.jpeg


/*
app.post('/checkout' ,async (req, res) => {
  const usersList = req.body;

  // Save the data of user that was sent by the client

  // Send a response to client that will show that the request was successfull.
  res.send({
    message: 'New user was added to the list',
  });

})
*/


app.post('/checkout', async (req, res) => {
 var sessionmode = "payment"

  try {
    console.log(req.body); 
    var arr = req.body;

    for(var i=0; i<arr.length;i++)
      {
        var arrPriceId = []
        data = arr[i]
         if (data.strRecurring == "Monthly") sessionmode = "subscription"

          /// Create product if it does not exist
            try {
              const existingProduct = await stripe.products.retrieve(data.strProductId);
              console.log('Product already exists - updating details', existingProduct);

              await stripe.products.update(data.strProductId, { name: data.strProduct,  description:data.strProductDesc, images: [data.strImage],});
            } 
            catch (error)
            {
            // Product does not exist, create it
            if (error.statusCode === 404) {
              const createdProduct = await stripe.products.create(
                  {id: data.strProductId, 
                  name: data.strPurpose,  
                  description:data.strPurposeDesc, 
                  images: [data.strImage]})
              console.log('Product created:', createdProduct);
            } else {
              console.error('Error:', error);
            }
          }
        
        var stripeprice = Math.trunc(data.numAmount * 100)
        var bFound = false;
        var prices = [];
        var has_more = true;
        while (has_more) {
          var parm = {
            product: data.strProductId,
            type:    (data.strRecurring == "Monthly") ? 'recurring' : 'one_time',
            limit:   100,
          }
          if (prices.length!=0) parm.starting_after = listPrices.data[listPrices.data.length - 1].id
        
          listPrices = await stripe.prices.list(parm);

          prices.push(...listPrices.data);
          has_more = listPrices.has_more
        }

        var priceId = ""
        for(var i=0; i < prices.length; i++)
        {
            if ( 
                (prices[i].currency == data.strCurrency.toLowerCase()) && 
                (stripeprice == prices[i].unit_amount)  
                
            )
            { arrPriceId.push( {price: prices[i].id,quantity: data.iCount} )
              bFound = true;
              break;
            }
        }

        if (!bFound) {

          // Create a new price
          var create_priece = {
            product: data.strProductId,
            unit_amount: stripeprice, 
            currency: data.strCurrency, 
          }
          if (data.strRecurring=="Monthly") create_priece.recurring = {interval: "month"} 
    
          var oPrice = await stripe.prices.create(create_priece);
          
          arrPriceId.push( {price: oPrice.id,quantity: data.iCount})
       }
      }
    // Create a checkout session

    checkout = {
      mode: sessionmode, //recurring?"subscription":"payment",
      line_items: arrPriceId,
      success_url: 'https://kidsim.org', // Replace with your success URL
      cancel_url: 'https://kidsim.org', // Replace with your cancel URL
//      client_reference_id: customText, // Add the custom text as client reference ID
//      custom_text: customText,
    }

//    if (sessionmode=="payment") 
//      checkout.payment_intent_data = {metadata: { abd:"test"}}
//    else
//      checkout.payment_data = {metadata: { abd:"test"}}

    const session = await stripe.checkout.sessions.create(checkout);
    


     res.json({url:session.url});

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});