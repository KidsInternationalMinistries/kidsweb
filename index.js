// To deply
//     Make sure in the kidsweb directory in terminal
//     cd kidsweb
//     gcloud init
//     Project kids-web-422406
//      gcloud run deploy stripe-gateway --source . --allow-unauthenticated --region=us-central1
//
// To debug use ngrok
//     ngrok http 8080 
//     access the url and answer 'Yes'
//     use the URL in webflow global script

// REMEMBER ************************
// Env variables do not load in google cloud.  they need to be added as you edit the service.
//  -- if we ever add more currencies or change our keys to stripe, they need to be updated in google cloud.
// *******************************************************
//
// example of what to post in a variable called field
//var fff =
/*
  {
  mode: "test" / "live"
  arrCart:
    [ 
    {"currency":"USD","price":"101", "recurring":"true", "productId":"productid","name":"abc","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/663333ea885f3eb487548d4f_P1000662.jpg","customText":"test"},
    {"currency":"USD","price":"102", "recurring":"false", "productId":"productid2","name":"dfg","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/65af1d4aca5b5bb61190c1df_30d977_e04ff02f9d4f4ab58c587cc96a0eba6b~mv2.webp","customText":"test"},
    {"currency":"USD","price":"103", "recurring":"false", "productId":"productid3","name":"hij","desc":"description","image":"https://assets-global.website-files.com/6460f65426be97bcff8a40bd/6632eec9927ca2f3a3a5d5bd_30d977_2836062d6fef41aa9b3e8171487681bd~mv2.webp","customText":"test"} 
   ]
*/

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const configStripe_Secret = {
	live: { usd: process.env.STRIPE_USD_SECRET_KEY,      cad: process.env.STRIPE_USD_SECRET_KEY,      other: process.env.STRIPE_OTHER_SECRET_KEY },
	test: { usd: process.env.STRIPE_USD_SECRET_TEST_KEY, cad: process.env.STRIPE_USD_SECRET_TEST_KEY, other: process.env.STRIPE_OTHER_SECRET_TEST_KEY},
};

var configStripe_Publishable = {
	live: { usd: process.env.STRIPE_USD_PUBLISHABLE_KEY,      cad: process.env.STRIPE_USD_PUBLISHABLE_KEY,       other: process.env.STRIPE_OTHER_PUBLISHABLE_KEY},
	test: { usd: process.env.STRIPE_USD_PUBLISHABLE_TEST_KEY, cad: process.env.STRIPE_USD_PUBLISHABLE_TEST_KEY , other: process.env.STRIPE_OTHER_PUBLISHABLE_TEST_KEY},
};

function GetStripeKey(strCurrency, strMode,bSecretKey)
{
//*****************force test mode until live */
//  strMode = "test"
//******************************************** */
   var stripeKey;
  var stripeSystem = strCurrency.toLowerCase();
  if ( (stripeSystem != "usd") && (stripeSystem != "cad") ) stripeSystem = "other"
  
  if(bSecretKey)
    stripeKey = configStripe_Secret[strMode][stripeSystem];
  else 
    stripeKey = configStripe_Publishable[strMode][stripeSystem];

  return stripeKey;

}

const express = require('express');
const bodyParser = require('body-parser');

/*
let corsOptions = { 
  origin : ['http://kidsim.webflow.io','http://www.kidsim.org'], 
}
*/

const corsOptions = {
  origin: '*', // Allow requests from any origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow all methods
  credentials: true // Allow sending cookies and authentication headers
};

const app = express();
const cors = require('cors') //- this makes it fail to deploy
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow preflight requests
app.use(bodyParser.json());

// Using express.urlencoded middleware
app.use(express.urlencoded({
    extended: true
}))

app.use('/public',express.static(__dirname + '/public'));

app.post('/checkout', async (req, res) => {
 var sessionmode = "payment"
 
  try {

    var arr = req.body.arrCart;
    console.log(arr)
    const stripeKey = GetStripeKey(arr[0].strCurrency, req.body.mode,true);
    var stripe = require('stripe')(stripeKey);

    var passthrough = {metadata:{}}

    var arrPriceId = []
    for(var i=0; i<arr.length;i++)
      {
        data = arr[i]
         if (data.strRecurring == "Monthly") sessionmode = "subscription"

          /// Create product if it does not exist
            try {
              const existingProduct = await stripe.products.retrieve(data.strProductId);
              console.log('Product already exists - updating details', existingProduct);

              await stripe.products.update(data.strProductId, { name: data.strPurpose,  description:data.strPurposeShortDesc, images: [data.strImage],});
            } 
            catch (error)
            {
            // Product does not exist, create it
            if (error.statusCode === 404) {
              const createdProduct = await stripe.products.create(
                  {id: data.strProductId, 
                  name: data.strPurpose,  
                  description:data.strPurposeShortDesc, 
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
              priceId = prices[i2].id;
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
          priceId = oPrice.id;
          
          arrPriceId.push( {price: oPrice.id,quantity: data.iCount})
        }
        passthrough.metadata["item-" + i]  = JSON.stringify({id:data.strProductId,idPrice:priceId,purpose:data.strPurpose,custompupose:data.strCustomPurpose,recur:data.strRecurring,amount:data.numAmount, currency:data.strCurrency, notify:data.strNotify,coverFee:data.bFee,count:data.iCount})
      }
    // Create a checkout session
    checkout = {
      ui_mode: 'embedded',
      billing_address_collection: 'required',
      phone_number_collection: {enabled: true},
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
    
    const stripePublishableKey = GetStripeKey(req.body.arrCart[0].strCurrency, req.body.mode,false);
    const session = await stripe.checkout.sessions.create(checkout);
     res.json({client_secret:session.client_secret, stripe_parishable:stripePublishableKey});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.post('/SessionStatus', async (req, res) => {
  const stripeKey = GetStripeKey(req.body.currency, req.body.testMode?"test":"live",true);
  var stripe = require('stripe')(stripeKey);
  
  var strReceipt
  try{
    const session = await stripe.checkout.sessions.retrieve(req.body.session_id);
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

      res.json({
        status: session.status,
        customer_email: session.customer_details.email,
        receipt_url:strReceipt
      });
  }
  catch(err)
  {
    console.error('Error in /session-status:', err);
    res.status(500).send({ error: 'An error occurred while retrieving session status.' });
  }
});


const port = 8080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


/*
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

*/