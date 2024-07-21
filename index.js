// To deply
// Make sure in the kidsweb directory in terminal
// cd kidsweb
// gcloud init
// Project kids-web-422406
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

app.get('/test', (req, res) => {
  res.type('text/plain'); // Set the content type to plain text
  res.send('Hello, this is plain text!'); // Send the plain text response
});


function displayDate(timestamp) {
  const date = new Date(timestamp * 1000); // Stripe timestamp is in seconds, convert to milliseconds
  return date.toLocaleString(); // Adjust the formatting as needed
}


app.get('/stripe-get', async (req, res) => {

  try{

    var dateStart = req.query.startdate
    var dateEnd = req.query.enddate

    const params = {
      limit: 100,
      created: {
        gte: Math.floor(new Date(dateStart).getTime() / 1000),
        lte: Math.floor(new Date(dateEnd).getTime() / 1000),
      },
    };

    res.set('Content-Type', 'text/plain')
    const arrPI = await stripe.paymentIntents.list(params)

    res.write("Date,Amount\r\n")

    for(var i = 0; i<arrPI.data.length; i++)
      {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: arrPI.data[i].id });
        const sessionId = sessions.data[0].id;
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    

        res.write(displayDate(arrPI.data[i].created) + ",")
        res.write(arrPI.data[i].amount.toFixed(2) + ",")
        res.write(arrPI.data[i].currency + ",") 
        res.write(arrPI.data[i].receipt_email + ",")

        
        res.write( "\r\n" )
      }

  }
  catch(err)
  {
      console.log(err)
  }

  res.end();
});



app.get('/session-status', async (req, res) => {
  var strReceipt
  try{
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (session.payment_intent != null)
      {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        const latest_charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        strReceipt = latest_charge.receipt_url
      }
    else
      {
        const invoice = await stripe.invoices.retrieve(session.invoice);
        strReceipt = invoice.hosted_invoice_url

      }
    res.send({
      status: session.status,
      customer_email: session.customer_details.email,
      receipt_url:strReceipt
    });
  }
  catch(err)
  {

  }
});


app.post('/checkout', async (req, res) => {
 var sessionmode = "payment"

  try {

    var arr = req.body.arrCart;
    var passthrough = {metadata:{}}

    var arrPriceId = []
    for(var i=0; i<arr.length;i++)
      {
        data = arr[i]
        passthrough.metadata["item-" + i]  = JSON.stringify({id:data.strProductId,purpose:data.strPurpose,recur:data.strRecurring,amount:data.numAmount,coverFee:data.bFee,count:data.iCount})
         if (data.strRecurring == "Monthly") sessionmode = "subscription"

          /// Create product if it does not exist
            try {
              const existingProduct = await stripe.products.retrieve(data.strProductId);
              console.log('Product already exists - updating details', existingProduct);

              await stripe.products.update(data.strProductId, { name: data.strPurpose,  description:data.strPurposeDesc, images: [data.strImage],});
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
        
        var stripeprice = Math.trunc(data.numAmount * ( data.bFee ? 1.05:1) * 100)
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
        for(var i2=0; i2 < prices.length; i2++)
        {
            if ( 
                (prices[i2].currency == data.strCurrency.toLowerCase()) && 
                (stripeprice == prices[i2].unit_amount)  
                
            )
            { arrPriceId.push( {price: prices[i2].id,quantity: data.iCount} )
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
      ui_mode: 'embedded',
      mode: sessionmode, //recurring?"subscription":"payment",
      line_items: arrPriceId,
      return_url: req.body.return_url + "?session_id={CHECKOUT_SESSION_ID}",
//      subscription_data: {metadata:{abc:"abc"}}
//      client_reference_id: customText, // Add the custom text as client reference ID
//      custom_text: customText,
    }

    if (sessionmode!="subscription")
      checkout.payment_intent_data = passthrough
    else
      checkout.subscription_data = passthrough
      

//    if (sessionmode=="payment") 
//      checkout.payment_intent_data = {metadata: { abd:"test"}}
//    else
//      checkout.payment_data = {metadata: { abd:"test"}}

    const session = await stripe.checkout.sessions.create(checkout);
    


     res.json({client_secret:session.client_secret});

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});