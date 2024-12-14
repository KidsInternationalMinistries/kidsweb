var urlKIDSWeb = document.getElementById("webflow_js").src.replace("/public/webflow.js", "")
console.log(urlKIDSWeb)


//*********************************************************************************************************************************
// Disable scrolling in parent when dropdowns are displayed.
//*********************************************************************************************************************************
document.addEventListener('DOMContentLoaded', initializeDisableScroll);  

function initializeDisableScroll() {
  // Function to disable scrolling for the body
  function disableScroll() {
      $('body').css({
          overflow: 'hidden',
          height: '100%',
      });
  }

  // Function to enable scrolling for the body
  function enableScroll() {
      $('body').css({
          overflow: '',
          height: '',
      });
  }

  // Attach event listeners to dropdown wrappers
  $('.nav-menu-drop').each(function () {
      const $dropdownWrapper = $(this);
      const $dropdownToggle = $dropdownWrapper.find('.nav-menu-toggle');
      const $dropdownMenu = $dropdownWrapper.find('.nav-menu-list');

      // Monitor toggle click
      $dropdownToggle.on('click', function () {
          // Toggle open/close state
          const isOpen = $dropdownWrapper.hasClass('w--open');

          if (isOpen) {
              // Collapse the dropdown
              $dropdownWrapper.removeClass('w--open');
              enableScroll();
              $dropdownMenu.css({
                  overflow: '',
                  maxHeight: '',
              });
          } else {
              // Expand the dropdown
              $('.nav-menu-drop.w--open').removeClass('w--open'); // Close other dropdowns
              $dropdownWrapper.addClass('w--open');
              disableScroll();
              $dropdownMenu.css({
                  overflow: 'auto',
                  maxHeight: '80vh',
              });
          }
      });
  });

  // Ensure all dropdowns are collapsed initially
  function collapseAllDropdowns() {
      $('.nav-menu-drop').removeClass('w--open');
      $('.nav-menu-list').css({
          overflow: '',
          maxHeight: '',
      });
      enableScroll();
  }

  // Optionally call collapseAllDropdowns on document load or other events
  collapseAllDropdowns();
}



//*********************************************************************************************************************************
// Code to hide menu if no items in cart when scrolled down and show when items in cart or scroll up
//*********************************************************************************************************************************

   document.addEventListener("DOMContentLoaded", function() {
    let lastScroll = window.scrollY;
    const menu = document.getElementById("NavSection"); // Adjust selector if your menu is not within the <header> tag
    const cartCountElement = document.getElementById("NavCartCount");
    const transitionTime = 0.5; // transition time in seconds

    // Set initial transition style for menu
    if (menu) {
      menu.style.transition = `opacity ${transitionTime}s ease`;
    }

    function updateMenuOpacity() {
      // Get the cart count as an integer
      const cartCount = parseInt(cartCountElement ? cartCountElement.innerText : "0", 10);
      
      if (cartCount > 0) {
        // If cart count is greater than 0, keep opacity at 100%
        menu.style.opacity = "1";
        return;
      }

      // Detect scroll direction
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) {
        // Scrolling down
        menu.style.opacity = "0";
      } else {
        // Scrolling up
        menu.style.opacity = "1";
      }
      lastScroll = currentScroll;
    }

    // Function to check cart count and set menu opacity to 100 if cartCount > 0
    function checkCartCount() {
      const cartCount = parseInt(cartCountElement ? cartCountElement.innerText : "0", 10);
      if (cartCount > 0) {
        menu.style.opacity = "1";
      }
    }

    // Set up a MutationObserver to monitor changes in cartCount
    if (cartCountElement) {
      const observer = new MutationObserver(checkCartCount);
      observer.observe(cartCountElement, { childList: true, subtree: true });
    }

    window.addEventListener("scroll", updateMenuOpacity);
  });
  

  
//*********************************************************************************************************************************
// DONATE TEST MODE FLAG
//*********************************************************************************************************************************

function initializeTestMode() {
    const wrapper = document.getElementById('DonateTestModeWrapper');
    const checkbox = document.getElementById('DonateTestMode');

    // Ensure both elements exist
    if (!wrapper || !checkbox) {
        console.warn('DonateTestModeWrapper or DonateTestMode checkbox not found.');
        return;
    }

    // Function to enable test mode
    function enableTestMode() {
        wrapper.style.display = 'block'; // Unhide the wrapper
        checkbox.checked = true; // Check the checkbox
        localStorage.setItem('testMode', 'true'); // Set testMode in localStorage
    }

    // Function to disable test mode
    function disableTestMode() {
        wrapper.style.display = 'none'; // Hide the wrapper
        checkbox.checked = false; // Uncheck the checkbox
        localStorage.removeItem('testMode'); // Remove testMode from localStorage
    }

    // Check if testMode is set in localStorage on page load
    if (localStorage.getItem('testMode') === 'true') {
        enableTestMode();
    } else {
        disableTestMode();
    }

    // Add an event listener for the checkbox
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            enableTestMode();
        } else {
            disableTestMode();
        }
    });

    // Add a keydown event listener for Alt + Ctrl + T
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 't') {
            enableTestMode(); // Enable test mode when the key combination is pressed
        }
    });
}

// Run the initialize function on page load
document.addEventListener('DOMContentLoaded', initializeTestMode);  
  

//*********************************************************************************************************************************
// Animate add to cart
//*********************************************************************************************************************************

function initializeAddCartAnimation() {
  document.querySelectorAll('.donateform').forEach(form => {
    // Add an event listener to the "Add to Cart" button
    const addToCartButton = form.querySelector('.donateaddtocart'); // Button that starts the animation
    const cartIcon = document.querySelector('.imagecart'); // Icon of the cart where the animation ends

    if (addToCartButton && cartIcon) {
      addToCartButton.addEventListener('click', event => {
        event.preventDefault(); // Prevent default button behavior

        // Create the animated circle container
        const flyingCircle = document.createElement('div');
        flyingCircle.style.position = 'fixed';
        flyingCircle.style.width = '50px';
        flyingCircle.style.height = '50px';
        flyingCircle.style.borderRadius = '50%'; // Make it a circle
        flyingCircle.style.backgroundColor = '#55511f'; // Background color
        flyingCircle.style.opacity = '0.5'; // Set transparency
        flyingCircle.style.display = 'flex';
        flyingCircle.style.alignItems = 'center';
        flyingCircle.style.justifyContent = 'center';
        flyingCircle.style.zIndex = '1000';
        flyingCircle.style.transition = 'transform 0.8s ease-in-out, opacity 0.8s ease-in-out';

        // Create the cart icon for the center of the animation
        const flyingImage = cartIcon.cloneNode(true);
        flyingImage.style.width = 'auto'; // Maintain the original size
        flyingImage.style.height = 'auto';
        flyingImage.style.opacity = '1'; // Ensure the image itself is fully visible

        // Add the cloned image to the flying circle
        flyingCircle.appendChild(flyingImage);

        // Insert the flying circle into the document body
        document.body.appendChild(flyingCircle);

        // Get positions for animation
        const buttonRect = addToCartButton.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Calculate the center points of the button and the cart
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        const cartCenterX = cartRect.left + cartRect.width / 2;
        const cartCenterY = cartRect.top + cartRect.height / 2;

        // Set the initial position of the flying circle (starting from the button's center)
        flyingCircle.style.left = `${buttonCenterX - 25}px`; // Offset for circle size (50px)
        flyingCircle.style.top = `${buttonCenterY - 25}px`; // Offset for circle size (50px)

        // Animate the circle to the center of the cart icon
        requestAnimationFrame(() => {
          flyingCircle.style.transform = `translate(${cartCenterX - buttonCenterX}px, ${cartCenterY - buttonCenterY}px) scale(1)`;
          flyingCircle.style.opacity = '0.5'; // Maintain transparency
        });

        // Clean up the flying circle after the animation
        flyingCircle.addEventListener('transitionend', () => {
          flyingCircle.remove();
        });
      });
    } else {
      console.error('Missing elements: Add to Cart button or Cart Icon');
    }
  });

  // Add dynamic CSS for animations (optional)
  const style = document.createElement('style');
  style.textContent = `
    .imageCart {
        transition: transform 0.2s ease-in-out;
    }
    .imageCart-enlarge {
        transform: scale(1.2);
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initializeAddCartAnimation);




//*********************************************************************************************************************************
// This is the code for the donate functionality
//*********************************************************************************************************************************
var gCur, objCart, iMaxDescLen = 75;
//const objCurrencyConv = { USD: 1, CAD: 1.36, PHP: 58.16, AUD: 1.50, NZD: 1.64, GBP: 0.79, EUR: 0.92, HKD: 7.18 }
//const objCurrencySym = { USD: "$", CAD: "$", PHP: "₱", AUD: "$", NZD: "$", GBP: "£", EUR: "€", HKD: "$" }
// objCurrencyDec = { USD: 2, CAD: 2, PHP: 0, AUD: 2, NZD: 2, GBP: 2, EUR: 2, HKD: 2 }




const initialStates = {
  donateamountdiv: { 'Enter-Monthly': "flex", 'Enter-Once': "flex", 'Enter-Choice': "flex" },
  donatecountdiv: { 'Fixed-Monthly': "flex", 'Fixed-Once': "flex", 'Items-Monthly': "flex", 'Items-Once': "flex" },
  donatefrequencyselect: { 'Enter-Choice': "block" },
  donatefrequencytext: { "Enter-Monthly": "block", "Enter-Once": "none" },
  donatefrequencytext2: { "Items-Monthly": "block", "Items-Once": "none" },
  donatecountselect: { 'Items-Monthly': "block", 'Items-Once': "block" },
  donatecountinput: {},
  donatefixeddesc: {"Items-Monthly":"block","Items-Once":"block"},
//  donatecurrencyselect: { 'Enter-Monthly': "block", 'Enter-Once': "block", 'Enter-Choice': "block", 'Fixed-Monthly': "block", 'Fixed-Once': "block", 'Items-Monthly': "block", 'Items-Once': "block" },
//  donatecurrencychange: { 'Enter-Monthly': "block", 'Enter-Once': "block", 'Enter-Choice': "block", 'Fixed-Monthly': "block", 'Fixed-Once': "block", 'Items-Monthly': "block", 'Items-Once': "block" },
//  donatecurrencyselect: {},
//  donatefeesdiv: {},
}

function CurrencyDisp(amount, cur) { 
  var conv = getCurrencyDetail(cur)
  return conv.symbol + Number(amount).toFixed(conv.decimal_digits) 

}
function getType(obj) { var arr = $(obj).find(".hidden_type").text().split("-"); return { type: arr[0], recur: arr[1] } }

function refreshCart() {
  if (objCart == undefined) {
    var strCart = localStorage.getItem("ShoppingCart");
    objCart = JSON.parse(strCart);
    if (objCart==null) objCart = [];
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
  localStorage.setItem("ShoppingCart",JSON.stringify(objCart))
}

function isStripeTest() { return (localStorage.getItem('testMode') === 'true') }

function StripeDonate(postData,type) {
  localStorage.setItem("DonateType",type)
  objData = { mode: isStripeTest()?"test":"live", arrCart: postData, return_url: "https://" + window.location.hostname + "/stripe/return" }
  $.ajax({
    url: urlKIDSWeb + '/Checkout',
    type: 'POST',
    data: JSON.stringify(objData),
    contentType: 'application/json',
    dataType: 'json',
    success: function (response) {
      console.log('Success:', response);
      window.location.replace("https://" + window.location.hostname + "/stripe/checkout?CheckoutID=" + response.client_secret + "&StripePublishable=" + response.stripe_parishable)
    },
    error: function (xhr, status, error) {
      console.error('Error:', error);
    }
  });
}

function DonateGetCurrent(obj) {
  var strImage
  var srcset = obj.find(".hidden_donateimage").attr("srcset")
  if (srcset == undefined)
    strImage = obj.find(".hidden_donateimage").attr("src");
  else {
    var arr = srcset.split(" ")
    strImage = arr[0]
  }

  var item =
  {
    strPurpose: obj.find(".hidden_donateministry").text(),
    strType: obj.find(".hidden_type").text(),
    strProductId: obj.find(".hidden_productid").text(),
    strFixed_SingularPlural: obj.find(".hidden_fixed_singular-plural").text(),
    strPurposeDesc: obj.find(".hidden_purposedesc").text().substring(0, 200),
    strCustomPurpose: obj.find(".donatecustompurposeinput").val(),
    numAmount: Number(obj.find(".donateamount").val()),
    strCurrency: obj.find(".donatecurrencyselect").val(),
    strImage: strImage,
    strRecurring: obj.find(".donatefrequencyselect").val(),
    bFee: obj.find(".donatefeescheckbox").is(":checked"),
    iCount: Number(obj.find(".donatecountinput").val())
  }
  return item;
}

var savedColors = {}
function EnableButton(obj,className,b)
{
  if (!savedColors[className]) 
    savedColors[className] = obj.css("background-color")     
  
  if (b) {
      obj.css('pointer-events','')
      obj.css("background-color",savedColors[className])       
    } else {
      obj.css("background-color","lightgray")       
      obj.css('pointer-events','none')
    }
//  $(obj).find(".donatedisableaddtocartbutton").css("display", b?"none":"block")
}

function FixAfterChange(obj) {
  var objType = getType(obj)
  var strCount = $(obj).find(".donatecountinput").val()
  var fAmount = 0;

  var sCur = $(obj).find(".donatecurrencyselect").val()
  var sCurOld = $(obj).find(".hidden_currency").text();
  if (sCurOld == "") sCurOld = "USD"
  $(obj).find(".hidden_currency").text(sCur);

  var convNew = getCurrencyDetail(sCur)
  $(obj).find(".donatesymbol").text(convNew.symbol)
  
  if ((objType.type == "Enter")) {
    var strAmount = $(obj).find(".donateamount").val()
    if (strAmount != "") 
      {
      var convOld = getCurrencyDetail(sCurOld)

      fAmount = ((Number(strAmount) / convOld.usd_conversion) * convNew.usd_conversion)
      fAmount = fAmount.toFixed(convNew.decimal_digits);
      }
    else
      fAmount = 0;
  }
  else
  {
    var conv = getCurrencyDetail(sCur)
    fAmount = (Number($(obj).find(".hidden_fixedamount").text()) * conv.usd_conversion).toFixed(conv.decimal_digits)
  }

  if (fAmount != 0) {
    if ((objType.type !== "Enter") || (sCur != sCurOld)) $(obj).find(".donateamount").val(fAmount)
      $(obj).find(".donatefixedamount").text(CurrencyDisp(fAmount, sCur))
    $(obj).find(".donatetotal").text("Total: " + CurrencyDisp(fAmount, sCur))
  
  }

  var bReqComplete = (($(obj).find(".hidden_custompurposetype").text() != "Required") || $(obj).find(".donatecustompurposeinput").val() != "")
  
  var bCoverFees = $(obj).find(".donatefeescheckbox").is(":checked")
  $(obj).find(".donatetotal").text((fAmount!=0)?"Total donation : " + CurrencyDisp(Number(strCount) * fAmount * (bCoverFees?1.05:1), sCur) :"")

  if (bReqComplete && (fAmount != 0) && (strCount != "")) {
    EnableButton($(obj).find(".donateonce"),"donateonce",true)
    EnableButton($(obj).find(".donateaddtocart"),"donateaddtocart",true)
     
    strFee = "Cover " + CurrencyDisp(Number(strCount) * fAmount * .05, sCur) + " transaction fee."
    $(obj).find(".donatefeestext").text(strFee)

  }
  else {
    EnableButton($(obj).find(".donateonce"),"donateonce",false)
    EnableButton($(obj).find(".donateaddtocart"),"donateaddtocart",false)
  }
}

function InitializeCheckout()
{
  refreshCart();

  if (objCart.length == 0) {
    $(".checkoutloadingcart").css("display", "none");
    $(".checkoutcartempty").css("display", "block")
    localStorage.setItem("ShoppingCart",JSON.stringify([]))
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
    $("#Button_Checkout").css("opacity", "0.5");
    $("#Button_Checkout")[0].innerText = "Processing..."
    StripeDonate(objCart,"Cart")  
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
    refreshCart()
    $(".checkoutloadingcart").css("display", "none");
    $(".checkoutcartempty").css("display", "block")
    $(".checkoutmain").css("display", "none")
  })
}

function InitializeDonateComponentsOnPage()
{
    // Hide unused controls for each donation component on page.
    $(".donateform").each(function (i, obj) {
      var objType = getType(obj)
      var strType = $(obj).find(".hidden_type").text()
  
      for (const key in initialStates) {
        var display = "none"
        if (initialStates[key][strType]) display = initialStates[key][strType];
        $(obj).find("." + key).css("display", display)
      }
  
//     $(top).find(".donatefrequencyselect").val("Once")
     $(obj).find(".donateamount").val("");
     $(obj).find(".donatecount1").val("");
     $(obj).find(".donatecustompurposeinput").css("display","none")
     $(obj).find(".donatepurposetext").css("display","none")

      $(obj).find(".donatefrequency").val(objType.recur)

      populateCurrencyDropdown($(obj).find(".donatecurrencyselect"))
      $(obj).find(".donatecurrencyselect").val(gCur)
  
      if (objType.type == "Fixed") {
        $(obj).find(".donatecountinput").val("1")
        if (objType.recur == "Monthly") $(obj).find(".donatefixeddesc").text("Monthly"); else $(obj).find(".donatefixeddesc").css("display","none")
        $(obj).find(".donatefrequencytext").text((objType.recur == "Monthly") ? " / Month" : "")
      }
  
      if (objType.type == "Enter") {
        $(obj).find(".donatecountinput").val("1")
        if (objType.recur == "Monthly") $(obj).find(".donatefrequencytext").text("Monthly"); else $(obj).find(".donatefrequencytext").css("display","none")
        if (objType.type != "Choice") {
          $(obj).find(".donatefixedamount").text(CurrencyDisp(Number($(obj).find(".hidden_fixedamount").text()), gCur))
          $(obj).find(".donatefrequencyselect").val(objType.recur=="Choice"?"Once":objType.recur)
        }
      }
  
      if (objType.type == "Items") {
        var arrSingularPlural = $(obj).find(".hidden_fixed_singular-plural").text().split("-")
        if (arrSingularPlural == []) arrSingularPlural = ["Item", "Items"]
  
        $(obj).find(".donatefrequencytext2").text(((objType.recur == "Monthly") ? "Monthly " : "") )
        $(obj).find(".donatefixeddesc").text(("per " + arrSingularPlural[0]))
  
//        $(obj).find(".donatecounttext").text(arrSingularPlural[1])
  
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

          $(obj).find(".donatepurposetext").css("display", "flex")
          $(obj).find(".donatecustompurposeinput").css("display", "block")

          $(obj).find(".donatecustompurposeinput").attr("placeholder", $(obj).find(".hidden_custompurposeplaceholder").text())
          var strCustomPurposeLink = $(obj).find(".hidden_custompurposelink").text();
          if (strCustomPurposeLink != "") $(obj).find(".donatecustompurposelink").text(strCustomPurposeLink)
           }
   
      FixAfterChange(obj)
//      $(obj).find(".donateloading").css("display", "none")
    })
}

document.addEventListener('DOMContentLoaded', OnLoadInitialize);  

function OnLoadInitialize() {
//  objCart = undefined;
  refreshCart();

  gCur = localStorage.getItem("Currency")
  if ((gCur == "") || gCur==null) { gCur = "USD"; localStorage.setItem("Currency",gCur) } 

  if (window.location.pathname == "/stripe/shopping-cart") { InitializeCheckout(); return; }
  InitializeDonateComponentsOnPage()

  $(".donatecountselect").change(function () {
    var top = $(this).closest('.donateform');
    var str = $(top).find(".donatecountselect").val()
    $(top).find(".donatecountinput").val(str)
    if (str == 10) {
      $(top).find(".donatecountselect").css("display", "none")
      $(top).find(".donatecountinput").css("display", "block")
//      $(top).find(".donatecounttext").css("display", "block")
    }
    FixAfterChange(top)
  })

  /*
  $(".donatecurrencychange").click(function () {
    var top = $(this).closest('.donateform');
    $(top).find(".donatecurrencychange").css("display", "none")
    $(top).find(".donatecurrencytext").css("display", "none")
    $(top).find(".donatecurrencyselect").css("display", "block")
  })
*/
  $(".donatecurrencyselect").change(function () {
    var top = $(this).closest('.donateform');
//    $(top).find(".donatecurrencytext").css("display", "block")
//    $(top).find(".donatecurrencychange").css("display", "block")
//    $(top).find(".donatecurrencyselect").css("display", "none")
    var cur = $(top).find(".donatecurrencyselect").val()
    if (cur=="Line")
    {
      $(top).find(".donatecurrencyselect").val(gCur)
      return;
    }
    else
    {
      gCur = cur
      localStorage.setItem("Currency",gCur)
    }
 
    // Handle currency change for each form
    $(".donateform").each(function (i, obj) {
      $(obj).find(".donatecurrencyselect").val(gCur)

//      $(obj).find(".donatecurrencytext").text(sCur)
      FixAfterChange(obj)
    })
  })

  //  Fix UI after change
  $(".donateamount").keyup(function () { var top = $(this).closest('.donateform'); FixAfterChange(top) })
  $(".donatecustompurposeinput").keyup(function () { var top = $(this).closest('.donateform'); FixAfterChange(top) })
  $(".donatecountselect").keyup(function () { var top = $(this).closest('.donateform'); FixAfterChange(top) })
  $(".donatecountinput").keyup(function () { var top = $(this).closest('.donateform'); FixAfterChange(top) })
  $(".donatefeescheckbox").change(function () { var top = $(this).closest('.donateform'); FixAfterChange(top) })

  $(".donatecustompurposeinput").keyup(function () { 
    var top = $(this).closest('.donateform');
    var obj = $(top).find(".donatecustompurposewarning")
    if (!obj.length == 0) obj.css("display","block")
   })


  $(".donateonce").click(function () {
    var top = $(this).closest('.donateform');
    var item = DonateGetCurrent(top)
    var arr = []
    arr.push(item)

//    $(top).find(".donatefeesdiv").css("display", "none")
    $(top).find(".donatetotaltext").text("Preparing for donation...")
//    EnableButton(top,false)
//    $(top).find(".changecurrency").css("display", "none")
//    $(top).find(".donatefrequency").css("display", "none")
//    $(top).find(".donateamount").css("display", "none")
//    $(top).find(".donatecount1").css("display", "none")
//    $(top).find(".donatecounttext").css("display", "none")

    StripeDonate(arr,"Once")
  })

  $(".donateaddtocart").click(function () {
    var top = $(this).closest('.donateform');
    var item = DonateGetCurrent(top)
    AddToCartCookie(item)

    InitializeDonateComponentsOnPage();
  //  EnableButton(top,true)

    console.log(objCart)
  })

  $(".donatecustompurposelink").click(function () {
    var top = $(this).closest(".donateform");
    $(top).find(".donatecustompurposewarning").css("display","block");
    $(top).find(".donatecustompurposelink").css("display","none")
    $(top).find(".donatecustompurposeinput").css("display","block")
  })
  
  $(".donatecustompurposewarningclose").click(function () {
    var top = $(this).closest(".donateform");
    $(top).find(".donatecustompurposewarning").remove();
  })
  
  $(".whatisfee").click(function () {
    var top = $(this).closest(".donateform");
    $(top).find(".donatetransactionfeedesc").css("display","block");
  
  })
  
  $(".donatetransactionfeedescclose").click(function () {
    var top = $(this).closest(".donateform");
    $(top).find(".donatetransactionfeedesc").css("display","none")
  })


  
  
}


