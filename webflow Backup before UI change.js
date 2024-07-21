var urlKIDSWeb;

urlKIDSWeb = document.getElementById("webflow_js").src.replace("/public/webflow.js","")
console.log(urlKIDSWeb)

var gCur;
//const urlKIDSWeb = "http://localhost:8080"
const objCurrencyConv = { USD:1, CAD:1.36, PHP:58.16, AUD:1.50, NZD:1.64, GBP:0.79, EUR:0.92, HKD:7.18 }  
const objCurrencySym = { USD:"$", CAD:"$", PHP:"₱", AUD:"$", NZD:"$", GBP:"£", EUR:"€", HKD:"$" }  
const objCurrencyDec = { USD:2, CAD:2, PHP:0, AUD:2, NZD:2, GBP:2, EUR:2, HKD:2 }  

var objCart;




const iMaxDescLen = 110;

function CurrencyDisp(amount,cur)
{
  return objCurrencySym[cur] + amount.toFixed(objCurrencyDec[cur]) + " " + cur
}

function getType(obj)
{
  var arr = $(obj).find(".hidden_type").text().split("-");
  return {type:arr[0],recur:arr[1]}
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname,strCookie)
{
  document.cookie = cname + "=" + strCookie + "; expires=Thu, 18 Dec 2100 12:00:00 UTC; path=/";
  console.log("set - " + strCookie)

}

function refreshCart() { 
   if (objCart == undefined) 
      { var strCart = getCookie("ShoppingCart"); 

        try {objCart = JSON.parse(strCart)} catch {objCart = []};
      }
      $("#NavCartCount").text(objCart.length)
      console.log(objCart)
}

function AddToCartCookie(objItem)
{
  refreshCart();
  objCart.push(objItem)
   SaveCart();
  $("#NavCartCount").text(objCart.length)
}

function SaveCart()
{
  setCookie("ShoppingCart",JSON.stringify(objCart))
}

function GetCart()
{
  refreshCart();
  $("#NavCartCount").text(objCart.length)
  return objCart;
}

function InitCheckoutPage()
{
  refreshCart();

  if (objCart.length==0)
    {
      $(".checkoutloadingcart").css("display", "none");
      $(".checkoutcartempty").css("display","block")
      setCookie("ShoppingCart",JSON.stringify([]))
    }
  else
  {

    var objItem = $(".checkoutitem")
    for(var i = 1; i < objCart.length; i++)
      objItem.clone().appendTo(".checkoutitems");

    objItemAll = $(".checkoutitem")
    objItemAll.each( function( index, objItem) {
      $( objItem ).find(".checkoutimage").attr("srcset", "")
      $( objItem ).find(".checkoutimage").attr("src", objCart[index].strImage)
      $( objItem ).find(".checkoutpurpose").text(objCart[index].strPurpose)
      $( objItem ).find(".checkoutpurposedesc").text(objCart[index].strPurposeDesc)
      var arrType = objCart[index].strType.split("-")

      var strPrice = ""
      if (arrType[0]=="Items")
        {
          var arr = objCart[index].strFixed_SingularPlural.split("-")
          strPrice = objCart[index].numAmount.toFixed() + "/" + arr[0] + "/" + objCart[index].strRecurring + "<br>"
          strPrice += objCart[index].iCount + " " + objCart[index].arr[1] + "<br>"      
          strPrice += "Total:" + CurrencyDisp((objCart[index].numAmount * objCart[index].iCount),gCur)
          
      /*
          $45/Student/month
          5 students
          Total:$135.00 / month
      */
        }
      else
      {
        strPrice += CurrencyDisp(objCart[index].numAmount,gCur)
        /*
          $135 / month
        */
      }
      if (objCart[index].strRecurring == "Monthly") strPrice += " / Month"


      $( objItem ).find(".checkoutpricedesc").html(strPrice)

      if (index == objItemAll.length-1)
        {
          $(".checkoutloadingcart").css("display","none")
          $(".checkoutmain").css("display","block")
        }
    });
  }

}



 
function StripeDonate(postData)
{
  objData = {arrCart:postData, return_url: "https://" + window.location.hostname + "/stripe/return"}
  $.ajax({
    url: urlKIDSWeb + '/Checkout', 
    type: 'POST',
    data: JSON.stringify(objData),
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      console.log('Success:', response);
      window.location.replace("https://" + window.location.hostname + "/stripe/checkout?" + response.client_secret)
    },
    error: function(xhr, status, error) {
        console.error('Error:', error);
    }
  });
}

function DonateGetCurrent(obj)
{
var strImage 
var srcset = obj.find(".donateimage").attr("srcset")
if (srcset==undefined)
  strImage = obj.find(".donateimage").attr("src");
else
{
  var arr = srcset.split(" ")
  strImage = arr[0]
}  

var item = 
  { strPurpose:obj.find(".hidden_purposedesc").text(),
    strType:obj.find(".hidden_type").text(),
    strProductId:obj.find(".hidden_productid").text(),
    strFixed_SingularPlural:obj.find(".hidden_fixed_singular-plural").text(),
    strPurposeDesc:obj.find(".donatepurposedescfull").text().substring(0,200),
    numAmount: Number(obj.find(".donateamount").val()),
    strCurrency: obj.find(".donatecurrency").val(),
    strImage: strImage,
    strRecurring:obj.find(".donatefrequency").val(),
    bFee:obj.find(".donatefeescheckbox").is(":checked"),
    iCount:Number(obj.find(".donatecount1").val())
  }
return item;
}


function Donate(obj)
{
var postData = []
postData.push(item)    
StripeDonate(postData)
}






function FixCurrencyText(obj)
{
  var objType = getType(obj)
  var sCur = $(obj).find(".donatecurrencyselect").val()  
  var sCurOld = $(obj).find(".hidden_currency").text();
  if (sCurOld=="") sCurOld = "USD"
  $(obj).find(".hidden_currency").text(sCur);

  var strSingularPlural = $(obj).find(".hidden_fixed_singular-plural").text()
  var strSingular,strPlural;
  if (strSingularPlural != "") 
    {
      var arr = strSingularPlural.split("-");
      strPlural = arr[1];
      strSingular = arr[0];
    }

  if ( (objType.type=="Enter") ) {
    fAmount = Number($(obj).find(".donateamount").val())
    $(obj).find(".donatecountinput").val("1")
    if (fAmount > 0)
    {
      fAmount = ((fAmount / objCurrencyConv[sCurOld]) * objCurrencyConv[sCur])
      fAmount = Math.round(fAmount*100)/100
      $(obj).find(".donateamount").val(fAmount)
    }
  }
  else
  {
    var fAmount = Number($(obj).find(".hidden_fixedamount").text()) * objCurrencyConv[sCur]
    $(obj).find(".donateamount").val(fAmount)
    var strFixedText = CurrencyDisp(fAmount,sCur) ;
    if (strSingular!=undefined) strFixedText += " / " + strSingular
    if (objType.recur == "Monthly") strFixedText += " / Month"
    var strDonateCountText = "Number of " + strPlural
    $(obj).find(".donatecounttext").text(strFixedText)
    $(obj).find(".donatecounttext").text(strDonateCountText)
  }

  var iCount = 1
  if (strSingular!=undefined)  
    iCount = Number($(obj).find(".donatecountinput").val())

  if ( (fAmount != 0) && (iCount != 0) )
  {
    $(obj).find(".donatedisableoncebutton").css("display","none") 
    $(obj).find(".donatedisableaddtocartbutton").css("display","none") 
    $(obj).find(".donatechangecurrency").css("display","block") 
    $(obj).find(".donatecurrencyselect").css("display","none") 
 
    strFee = "Add " + CurrencyDisp(iCount * fAmount * .05,sCur) +  " to cover transaction fees"
    $(obj).find(".donatefeesamounttext").text(strFee)

    var fTotal = fAmount * iCount;
    if ($(obj).find(".donatefeescheckbox").prop("checked")) fTotal = fTotal * 1.05;

    strTotal = "Total : " +  CurrencyDisp(fTotal,sCur)
    if ( (objType.recur=="Monthly") || ( (objType.recur=="Choice") && $(obj).find(".donatefrequencyselect").val() == "Monthly")) 
      {
        strTotal += " / Month"
        $(obj).find(".donatefrequencyselect").val("Monthly")
      }
    else
      $(obj).find(".donatefrequencyselect").val("OneTime")
    
    $(obj).find(".donatetotaltext").text(strTotal)
    $(obj).find(".donatefees").css("display","block")
   }
  else
  {
    $(obj).find(".donatefees").css("display","none")
    $(obj).find(".donatetotaltext").text("Enter required fields first.")
    $(obj).find(".donatedisableoncebutton").css("display","block") 
    $(obj).find(".donatedisableaddtocartbutton").css("display","block") 

   $(obj).find(".changecurrency").css("display","none") 
     
  }
}

function OnLoadInitialize() {
  objCart = undefined;
  refreshCart();

  var strCurrency = getCookie("Currency")
  if (strCurrency == "") strCurrency = "USD"
  gCur = strCurrency;

  if (window.location.pathname == "/checkout")
    {
      InitCheckoutPage() 
      refreshCart()
      
      $("#Button_Checkout").click(function()
      {
 
        StripeDonate(objCart)
        setCookie("ShoppingCart",[])
        
      })

      $(".checkoutitemremove").click(function()
      {
          var top = $(this).closest('.checkoutitem');
          $(".checkoutitem").each(function(i,obj) {
            if (obj == top[0])
              { $(top).remove(); 
                objCart.splice(i, 1);;
              }
              SaveCart()
              if (objCart.length==0)
                {
                  $(".checkoutloadingcart").css("display", "none");
                  $(".checkoutcartempty").css("display","block")
                  $(".checkoutmain").css("display","none")
                }
          })
      })

      $("#Button_RemoveAll").click(function()
      {
        objCart = []
        SaveCart()
        $(".checkoutloadingcart").css("display", "none");
        $(".checkoutcartempty").css("display","block")
        $(".checkoutmain").css("display","block")
      })
    }

    $(".donateform").each(function(i,obj) { 
      var objType = getType(obj)
      
  
  //    $(obj).find(".donatefixedfreq").text(objType.recur);
      var objSingularPlural;

      // Initialize the inputs if they are hidden
      if (objType.type=="Fixed")  $(obj).find(".donateamount").val( $(obj).find(".hidden_fixedamount"))
      var strSingularPlural = $(obj).find(".hidden_fixed_singular-plural").text()
      if (strSingularPlural != "") 
          objSingularPlural = strSingularPlural.split("-")
      else
         $(obj).find(".donatecount1").val( "1" )

      var strInfoType = $(obj).find(".hidden_infotype").text()

      if ( (strInfoType=="Display") || (strInfoType=="Required")) $(obj).find(".donateinfo").css("display","block")
      if (strInfoType=="CustomPurpose") $(obj).find(".donateaddinfo").css("display","block")
        $(obj).find(".donateinfo").attr("placeholder",$(obj).find(".hidden_infoplaceholder").text()) 
      var strAddInfo = $(obj).find(".hidden_infotext").text();

      if (strAddInfo!="") $(obj).find(".donateaddinfo").text(strAddInfo) 
 
      // Adjust description length and add (Read More...)
      var strPurposeDesc = $(obj).find(".donatepurposedescfull").html();
      if (strPurposeDesc.length > iMaxDescLen)
      {
        strPurposeDesc = strPurposeDesc.substring(0,iMaxDescLen) + "... <u style='color:blue;' >(read more)</u> " 
      }
      $(obj).find(".donatepurposedesc").html(strPurposeDesc);

      // Handle fixed and item changes
      if (objType.type=="Fixed") {
        $(obj).find(".donatefixedpricing1").css("display", "block");
        $(obj).find(".donatefixedpricing2").css("display", (objSingularPlural!==undefined)?"flex":"none");
        $(obj).find(".donatefixedfreq").css("display", "block");
      }
      else
      {
          // Handle changes for varibale amount
          $(obj).find(".donategeneralpricing").css("display", "flex");
          if (objType.recur=="Choice") 
            $(obj).find(".donatefrequency").css("display","block")
          else
            if (objType.recur=="Month")
            {
              // set freq to Monthly and hide freq and display "/Month"
              $(obj).find(".donatefrequency").val("Monthly") 
              $(obj).find(".donatefreqdiv").css("display","block")
              $(obj).find(".donatefrequencymonth").css("display","block")
            }
          }
        
        $(obj).find(".donatecurrency").val(gCur) 
        FixCurrencyText(obj) 
  
        })
  
  
        $(".donatecurrency").change(function(){
          var top = $(this).closest('.donateform');
          var sCur = $(top).find(".donatecurrency").val()  
          setCookie("Curency",sCur)
        
         // FixCurrencyText(top) 
          // Handle currency change for each form
          $(".donateform").each(function(i,obj){
            $(obj).find(".donatecurrency").val(sCur)
            FixCurrencyText(obj)
          })
        })  

         

        $(".donatefeescheckbox").change(function()
        {
          var top = $(this).closest('.donateform');
          FixCurrencyText(top)
        })
      
        $(".donateamount").keyup(function(){
          var top = $(this).closest('.donateform');
          FixCurrencyText(top)
      })
      
      $(".donatecount1").keyup(function(){
        var top = $(this).closest('.donateform');
        FixCurrencyText(top)
      })
      
      $(".donatefrequency").change(function(){
        var top = $(this).closest('.donateform');
        FixCurrencyText(top)
      })
      
      $(".donatepurposedesc").click(function(){
        var top = $(this).closest('.donateform');
      
        if ($(top).find(".donatepurposedesc").html().length > iMaxDescLen )
        {
            $(top).find(".donatedetailsdiv").css("display","block") 
            $(top).find(".donatemaindiv").css("display","none") 
        }
      })
      
      $(".donatedetailsclose").click(function(){
        var top = $(this).closest('.donateform');
        $(top).find(".donatedetailsdiv").css("display","none") 
        $(top).find(".donatemaindiv").css("display","block") 
      })
      
      $(".donatecustomwarningclose").click(function(){
        var top = $(this).closest('.donateform');
        $(top).find(".donatecustomwarningdiv").css("display","none") 
        $(top).find(".donatemaindiv").css("display","block") 
      })
      
      $(".changecurrency").click(function(){
        var top = $(this).closest('.donateform');
      
        $(top).find(".donatedisableoncebutton").css("display","block") 
        $(top).find(".donatedisableaddtocartbutton").css("display","block") 
        $(top).find(".changecurrency").css("display","none") 
        $(top).find(".donatecurrency").css("display","block") 
      })


      $(".donateaddinfo").click(function()
      {
        var top = $(this).closest('.donateform');
 
        if (top.find(".hidden_infotype").text()=="CustomPurpose")
          {
            $(top).find(".donatecustomwarningdiv").css("display","block")
            $(top).find(".donatemaindiv","none").css("display","none")
          }
        
        $(top).find(".donateinfo").css("display","block")
        $(top).find(".donateaddinfo").css("display","none")
      })
      
      /*
      $(".donateaboutdropdown").click(function(){
        var top = $(this).closest('.donateform');
        $(top).find(".donateaboutlist").css("display","none") 
      })
    */
    
      $(".donateonce").click(function(){
        var top = $(this).closest('.donateform');
        var item =  DonateGetCurrent(top)
        var arr = []
        arr.push(item)

        $(top).find(".donatefees").css("display","none")
        $(top).find(".donatetotaltext").text("Preparing for donation...")
        $(top).find(".donatedisableoncebutton").css("display","block") 
        $(top).find(".donatedisableaddtocartbutton").css("display","block") 
        $(top).find(".changecurrency").css("display","none") 
        $(top).find(".donatefrequency").css("display","none")
        $(top).find(".donateamount").css("display","none")
        $(top).find(".donatecount1").css("display","none")
        $(top).find(".donatecounttext").css("display","none")
 
        StripeDonate( arr)
      })
    
      $(".donateaddtocart").click(function(){
        var top = $(this).closest('.donateform');
        var item =  DonateGetCurrent(top)
        AddToCartCookie(item)

        $(top).find(".donatefees").css("display","none")
        $(top).find(".donatetotaltext").text("Added to cart")
        $(top).find(".donatedisableoncebutton").css("display","block") 
        $(top).find(".donatedisableaddtocartbutton").css("display","block") 
        $(top).find(".changecurrency").css("display","none") 
        $(top).find(".donatefrequency").css("display","none")
        $(top).find(".donateamount").css("display","none")
        $(top).find(".donatecount1").css("display","none")
        $(top).find(".donatecounttext").css("display","none")
 
        console.log(objCart)
      })
    

    }

  