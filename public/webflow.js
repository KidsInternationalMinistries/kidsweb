var urlKIDSWeb = document.getElementById("webflow_js").src.replace("/public/webflow.js", "")
console.log(urlKIDSWeb)
//const urlKIDSWeb = "http://localhost:8080"

var gCur;
var objCart;
const iMaxDescLen = 75;

const objCurrencyConv = { USD: 1, CAD: 1.36, PHP: 58.16, AUD: 1.50, NZD: 1.64, GBP: 0.79, EUR: 0.92, HKD: 7.18 }
const objCurrencySym = { USD: "$", CAD: "$", PHP: "₱", AUD: "$", NZD: "$", GBP: "£", EUR: "€", HKD: "$" }
const objCurrencyDec = { USD: 2, CAD: 2, PHP: 0, AUD: 2, NZD: 2, GBP: 2, EUR: 2, HKD: 2 }

const initialStates = {
  donatequantitydiv: { "Items-Monthly": 1, "Items-Once": 1 },
  donateamountdiv: { 'Enter-Monthly': 1, 'Enter-Once': 1, 'Enter-Choice': 1 },
  donatecountdiv: { 'Fixed-Monthly': 1, 'Fixed-Once': 1, 'Items-Monthly': 1, 'Items-Once': 1 },
  donatefrequencyselect: { 'Enter-Choice': 1 },
  donatefrequencytext: { "Enter-Monthly": 1, "Enter-Once": 1 },
  donatecountselect: { 'Items-Monthly': 1, 'Items-Once': 1 },
  donatecountinput: {},
  donatecurrencyselect: { 'Enter-Monthly': 1, 'Enter-Once': 1, 'Enter-Choice': 1, 'Fixed-Monthly': 1, 'Fixed-Once': 1, 'Items-Monthly': 1, 'Items-Once': 1 },
  donatecurrencychange: { 'Enter-Monthly': 1, 'Enter-Once': 1, 'Enter-Choice': 1, 'Fixed-Monthly': 1, 'Fixed-Once': 1, 'Items-Monthly': 1, 'Items-Once': 1 },
  donatecurrencyselect: {},
  donatecustompurposelink: {},
  donatecounttext: {},
  donatefeesdiv: {},
}

function CurrencyDisp(amount, cur) { return objCurrencySym[cur] + Number(amount).toFixed(objCurrencyDec[cur]) }
function getType(obj) { var arr = $(obj).find(".hidden_type").text().split("-"); return { type: arr[0], recur: arr[1] } }

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
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

function setCookie(cname, strCookie) {
  document.cookie = cname + "=" + strCookie + "; expires=Thu, 18 Dec 2100 12:00:00 UTC; path=/";
  console.log("set - " + strCookie)
}

function refreshCart() {
  if (objCart == undefined) {
    var strCart = getCookie("ShoppingCart");

    try { objCart = JSON.parse(strCart) } catch { objCart = [] };
  }
  $("#NavCartCount").text(objCart.length)
  console.log(objCart)
}

function AddToCartCookie(objItem) {
  refreshCart();
  objCart.push(objItem)
  SaveCart();
  $("#NavCartCount").text(objCart.length)
}

function SaveCart() {
  setCookie("ShoppingCart", JSON.stringify(objCart))
}

function GetCart() {
  refreshCart();
  $("#NavCartCount").text(objCart.length)
  return objCart;
}



function StripeDonate(postData) {
  objData = { arrCart: postData, return_url: "https://" + window.location.hostname + "/stripe/return" }
  $.ajax({
    url: urlKIDSWeb + '/Checkout',
    type: 'POST',
    data: JSON.stringify(objData),
    contentType: 'application/json',
    dataType: 'json',
    success: function (response) {
      console.log('Success:', response);
      window.location.replace("https://" + window.location.hostname + "/stripe/checkout?" + response.client_secret)
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    }
  });
}

function DonateGetCurrent(obj) {
  var strImage
  var srcset = obj.find(".donateimage").attr("srcset")
  if (srcset == undefined)
    strImage = obj.find(".donateimage").attr("src");
  else {
    var arr = srcset.split(" ")
    strImage = arr[0]
  }

  var item =
  {
    strPurpose: obj.find(".donateministry").text(),
    strType: obj.find(".hidden_type").text(),
    strProductId: obj.find(".hidden_productid").text(),
    strFixed_SingularPlural: obj.find(".hidden_fixed_singular-plural").text(),
    strPurposeDesc: obj.find(".hidden_purposedesc").text().substring(0, 200),
    numAmount: Number(obj.find(".donateamount").val()),
    strCurrency: obj.find(".donatecurrencytext").text(),
    strImage: strImage,
    strRecurring: obj.find(".donatefrequencyselect").val(),
    bFee: obj.find(".donatefeescheckbox").is(":checked"),
    iCount: Number(obj.find(".donatecountinput").val())
  }
  return item;
}

function EnableButtons(obj,b)
{
  $(obj).find(".donatedisableoncebutton").css("display", b?"none":"block")
  $(obj).find(".donatedisableaddtocartbutton").css("display", b?"none":"block")
}

/*
function Donate(obj) {
  var postData = []
  postData.push(item)
  StripeDonate(postData)
}
*/

function FixAfterChange(obj) {
  var objType = getType(obj)
  var strCount = $(obj).find(".donatecountinput").val()
  var fAmount = 0;

  var sCur = $(obj).find(".donatecurrencyselect").val()
  var sCurOld = $(obj).find(".hidden_currency").text();
  if (sCurOld == "") sCurOld = "USD"
  $(obj).find(".hidden_currency").text(sCur);


  if ((objType.type == "Enter")) {
    var strAmount = $(obj).find(".donateamount").val()
    if (strAmount != "") 
      fAmount = ((Number(strAmount) / objCurrencyConv[sCurOld]) * objCurrencyConv[sCur]).toFixed(objCurrencyDec[sCur])
    else
      fAmount = 0;
  }
  else
    fAmount = (Number($(obj).find(".hidden_fixedamount").text()) * objCurrencyConv[sCur]).toFixed(objCurrencyDec[sCur])


  if (fAmount != 0) {
    if ((objType.type !== "Enter") || (sCur != sCurOld)) $(obj).find(".donateamount").val(fAmount)
    $(obj).find(".donatefixedamount").text(CurrencyDisp(fAmount, sCur))
  }

  var bReqComplete = (($(obj).find(".hidden_custompurposetype").text() != "Required") || $(obj).find(".donatecustompurposeinput").val() != "")

  if (bReqComplete && (fAmount != 0) && (strCount != "")) {
    EnableButtons(obj,true)

    strFee = "Cover " + CurrencyDisp(Number(strCount) * fAmount * .05, sCur) + " transaction fee."
    $(obj).find(".donatefeestext").text(strFee)
    $(obj).find(".donatefeesdiv").css('display', 'flex');
  }
  else {
    $(obj).find(".donatefeesdiv").css("display", "none")
    EnableButtons(obj,false)
  }
}

function InitializeCheckout()
{
  refreshCart();

  if (objCart.length == 0) {
    $(".checkoutloadingcart").css("display", "none");
    $(".checkoutcartempty").css("display", "block")
    setCookie("ShoppingCart", JSON.stringify([]))
  }
  else {
    
    
    
    var objItem = $(".checkoutitem")
    for (var i = 1; i < objCart.length; i++)
      objItem.clone().appendTo(".checkoutitems");

    objItemAll = $(".checkoutitem")
    objItemAll.each(function (index, objItem) {
      $(objItem).find(".checkoutimage").attr("srcset", "")
      $(objItem).find(".checkoutimage").attr("src", objCart[index].strImage)
      $(objItem).find(".checkoutpurpose").text(objCart[index].strPurpose)
      $(objItem).find(".checkoutpurposedesc").text(objCart[index].strPurposeDesc)
      var arrType = objCart[index].strType.split("-")

      var strPrice = ""
      if (arrType[0] == "Items") {
        var arr = objCart[index].strFixed_SingularPlural.split("-")
        strPrice = objCart[index].numAmount.toFixed() + "/" + arr[0] + "/" + objCart[index].strRecurring + "<br>"
        strPrice += objCart[index].iCount + " " + arr[1] + "<br>"
        strPrice += "Total:" + CurrencyDisp((objCart[index].numAmount * objCart[index].iCount), gCur)
      }
      else {
        strPrice += CurrencyDisp(objCart[index].numAmount, gCur)
      }
      if (objCart[index].strRecurring == "Monthly") strPrice += " / Month"

      $(objItem).find(".checkoutpricedesc").html(strPrice)

      if (index == objItemAll.length - 1) {
        $(".checkoutloadingcart").css("display", "none")
        $(".checkoutmain").css("display", "block")
      }
    });
  }

  $("#Button_Checkout").click(function () {

    StripeDonate(objCart)
    setCookie("ShoppingCart", [])

  })

  $(".checkoutitemremove").click(function () {
    var top = $(this).closest('.checkoutitem');
    $(".checkoutitem").each(function (i, obj) {
      if (obj == top[0]) {
        $(top).remove();
        objCart.splice(i, 1);;
      }
      SaveCart()
      if (objCart.length == 0) {
        $(".checkoutloadingcart").css("display", "none");
        $(".checkoutcartempty").css("display", "block")
        $(".checkoutmain").css("display", "none")
      }
    })
  })

  $("#Button_RemoveAll").click(function () {
    objCart = []
    SaveCart()
    $(".checkoutloadingcart").css("display", "none");
    $(".checkoutcartempty").css("display", "block")
    $(".checkoutmain").css("display", "block")
  })
}

function InitializeDonateComponentsOnPage()
{
    // Hide unused controls for each donation component on page.
    $(".donateform").each(function (i, obj) {
      var objType = getType(obj)
      var strType = $(obj).find(".hidden_type").text()
  
      for (const key in initialStates) {
        var hidden = true
        if (initialStates[key][strType] == 1) hidden = false;
        if (hidden) $(obj).find("." + key).css("display", "none")
      }
  
      $(obj).find(".donatefrequency").val(objType.recur)
      $(obj).find(".donatecurrency").val(gCur)
  
      if (objType.type == "Fixed") {
        $(obj).find(".donatecountinput").val("1")
        $(obj).find(".donatefixeddesc").text(((objType.recur == "Monthly") ? "monthly " : "one time"))
        $(obj).find(".donatefrequencytext").text((objType.recur == "Monthly") ? " / month" : " one time")
      }
  
      if (objType.type == "Enter") {
        $(obj).find(".donatecountinput").val("1")
        $(obj).find(".donatefrequencytext").text(((objType.recur == "Monthly") ? "monthly " : "one  time"))
        if (objType.type != "Choice") {
          $(obj).find(".donatefixedamount").text(CurrencyDisp(Number($(obj).find(".hidden_fixedamount").text()), gCur))
          $(obj).find(".donatefrequencyselect").val(objType.recur)
        }
      }
  
      if (objType.type == "Items") {
        var arrSingularPlural = $(obj).find(".hidden_fixed_singular-plural").text().split("-")
        if (arrSingularPlural == []) arrSingularPlural = ["Item", "Items"]
  
        $(obj).find(".donatefixeddesc").text(((objType.recur == "Monthly") ? "monthly " : "") + ((objType.type == "Items") ? ("/ " + arrSingularPlural[0]) : ""))
  
        $(obj).find(".donatecounttext").text(arrSingularPlural[1])
  
        var objSel = $(obj).find(".donatecountselect")
        objSel.append("<option value='' disabled selected  style='color:gray'>Select number...</option>")
  
        for (var i = 1; i <= 10; i++) {
          var o;
          if (i == 10)
            o = new Option(i + "+ " + arrSingularPlural[1], "10")
          else
            o = new Option(i + " " + ((i == 1) ? arrSingularPlural[0] : arrSingularPlural[1]), i + "",);
          objSel.append(o);
        }
      }
  
      var strCustomPurposeType = $(obj).find(".hidden_custompurposetype").text()
      if (strCustomPurposeType != "") {
        if ((strCustomPurposeType == "Allowed"))
          $(obj).find(".donatecustompurposelink").css("display", "block")
  
        if (strCustomPurposeType == "Required") {
          $(obj).find(".donatepurposetext").css("display", "none")
          $(obj).find(".donatecustompurposelink").css("display", "none")
          $(obj).find(".donatecustompurposeinput").css("display", "block")
        }
  
        $(obj).find(".donatecustompurposeinput").attr("placeholder", $(obj).find(".hidden_custompurposeplaceholder").text())
        var strCustomPurposeLink = $(obj).find(".hidden_custompurposelink").text();
        if (strCustomPurposeLink != "") $(obj).find(".donatecustompurposelink").text(strCustomPurposeLink)
      }
  
      // Adjust description length and add (Read More...)
      var strPurposeDesc = $(obj).find(".donatepurposedescfull").html();
      if (strPurposeDesc.length > iMaxDescLen) {
        strPurposeDesc = strPurposeDesc.substring(0, iMaxDescLen) + "... <u style='color:blue;' >(read more)</u> "
      }
  
      $(obj).find(".donatepurposetext2").html(strPurposeDesc);
      FixAfterChange(obj)
      $(obj).find(".donateloading").css("display", "none")
    })
}

function OnLoadInitialize() {
//  objCart = undefined;
  refreshCart();

  var strCurrency = getCookie("Currency")
  if (strCurrency == "") strCurrency = "USD"
  gCur = strCurrency;

  if (window.location.pathname == "/checkout") { InitializeCheckout(); return; }
  InitializeDonateComponentsOnPage()

  $(".donatecountselect").change(function () {
    var top = $(this).closest('.donateform');
    var str = $(top).find(".donatecountselect").val()
    $(top).find(".donatecountinput").val(str)
    if (str == 10) {
      $(top).find(".donatecountselect").css("display", "none")
      $(top).find(".donatecountinput").css("display", "block")
      $(top).find(".donatecounttext").css("display", "block")
    }
    FixAfterChange(top)
  })

  $(".donatecurrencychange").click(function () {
    var top = $(this).closest('.donateform');
    $(top).find(".donatecurrencychange").css("display", "none")
    $(top).find(".donatecurrencytext").css("display", "none")
    $(top).find(".donatecurrencyselect").css("display", "block")
  })

  $(".donatecurrencyselect").change(function () {
    var top = $(this).closest('.donateform');

    $(top).find(".donatecurrencytext").css("display", "block")
    $(top).find(".donatecurrencychange").css("display", "block")
    $(top).find(".donatecurrencyselect").css("display", "none")
    var sCur = $(top).find(".donatecurrencyselect").val()
    setCookie("Curency", sCur)

    // FixAfterChange(top) 
    // Handle currency change for each form
    $(".donateform").each(function (i, obj) {
      $(obj).find(".donatecurrencyselect").val(sCur)
      $(obj).find(".donatecurrencytext").text(sCur)
      FixAfterChange(obj)
    })
  })

  $(".donateamount").keyup(function () {
    var top = $(this).closest('.donateform');
    FixAfterChange(top)
  })

  $(".donatecustompurposeinput").keyup(function () {
    var top = $(this).closest('.donateform');
    FixAfterChange(top)
  })

  $(".donatecountselect").keyup(function () {
    var top = $(this).closest('.donateform');
    FixAfterChange(top)
  })

  $(".donatecountinput").keyup(function () {
    var top = $(this).closest('.donateform');
    FixAfterChange(top)
  })

  $(".donateonce").click(function () {
    var top = $(this).closest('.donateform');
    var item = DonateGetCurrent(top)
    var arr = []
    arr.push(item)

    $(top).find(".donatefeesdiv").css("display", "none")
    $(top).find(".donatetotaltext").text("Preparing for donation...")
    EnableButtons(top,false)
    $(top).find(".changecurrency").css("display", "none")
    $(top).find(".donatefrequency").css("display", "none")
    $(top).find(".donateamount").css("display", "none")
    $(top).find(".donatecount1").css("display", "none")
    $(top).find(".donatecounttext").css("display", "none")

    StripeDonate(arr)
  })

  $(".donateaddtocart").click(function () {
    var top = $(this).closest('.donateform');
    var item = DonateGetCurrent(top)
    AddToCartCookie(item)

    $(top).find(".donatefeesdiv").css("display", "none")
    $(top).find(".donatetotaltext").text("Added to cart")
    EnableButtons(top,false)
    $(top).find(".changecurrency").css("display", "none")
    $(top).find(".donatefrequency").css("display", "none")
    $(top).find(".donateamount").css("display", "none")
    $(top).find(".donatecount1").css("display", "none")
    $(top).find(".donatecounttext").css("display", "none")

    console.log(objCart)
  })
}


