const objCurrency = {
    USD:1,
    CAD:1.36,
    PHP:58.16,
    AUD:1.50,
    NZD:1.64,
    GBP:0.79,
    EUR:0.92,
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
  
  var bInSetAllCurrency = false;
  
  function SetAllCurrency(sCur)
    {    
      bInSetAllCurrency = true;
      $(".donateform").each(function(i,obj) {  
          $(obj).find(".donatecurrency").val(sCur)
        UpdateForm($(obj).closest(".donateform"))
      })
      bInSetAllCurrency = false;
    }
  
  const iMaxDescLen = 40;
  
  
  function UpdateForm(obj,bKeypressOnly)
  {
    var bFixedWithCount = false;
    var bFixedMonthly = false;
    var strPlural 
    var strSingular
    var fAmount
  
    const options = {
      style: 'decimal',  
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  
    var strPurposeDesc = $(obj).find(".donatepurposedesc").html();
    if (strPurposeDesc.length > iMaxDescLen)
    {
      strPurposeDesc = strPurposeDesc.substring(0,iMaxDescLen) + "... <u style='color:blue;' >(read more)</u> " 
      $(obj).find(".donatepurposedesc").html(strPurposeDesc);
    }
  
  
    var fAmount = 0;
    var sCur = obj.find(".donatecurrency").val()
  
    var arr = obj.find(".hidden_type").text().split("-");
    var type = arr[0]
    var recur = arr[1]
  
    if ( (type=="Fixed") || (type=="Item") ) {
      var strAmount = obj.find(".hidden_fixedamount").text();
      fAmount = strAmount * objCurrency[sCur]
  //    bFixedWithCount = obj.find(".hidden_flag_fixedwithcount").text()=="1"
  //    bFixedMonthly = obj.find(".hidden_flag_fixedmonthly").text()=="1"
  
      if (!bKeypressOnly)
      { 
        var objFreq = obj.find(".donatefixedfreq")
        objFreq.css("display", "block");
        objFreq.text = recur;
  
        strPlural = obj.find(".hidden_fixedplural").text();
        strSingular = obj.find(".hidden_fixedsingular").text();
    
        $(obj).find(".donatefixedpricing1").css("display", "block");
        $(obj).find(".donatefixedpricing2").css("display", (type=="Item")?"flex":"none");
        
        var strFixedText = Number(fAmount).toLocaleString('en-US', {style:"currency", currency:sCur}) ;
        if (type=="Item") strFixedText += " / " + strSingular
        if (recur == "Month") strFixedText += " / " + recur
      
        var strDonateCountText = "Number of " + strPlural
    
        obj.find(".donatefixedtext").text(strFixedText)
        obj.find(".donatecounttext").text(strDonateCountText)
      }
    }
    else
    {
      obj.find(".donategeneralpricing").css("display", "flex");
      if (recur=="Choice") 
        $(obj).find(".donatefrequency").css("display","block")
      else
        if (recur=="Month")
        {
          // set freq to Monthly and hide freq and display "/Month"
          $(obj).find(".donatefrequency").val("Monthly") 
          $(obj).find(".donatefreqdiv").css("display","block")
          $(obj).find(".donatefrequencymonth").css("display","block")
        }
      var strAmount = $(obj).find(".donateamount").val()
      fAmount = Number(strAmount)
      if (!bKeypressOnly)
      {
        var strOldCurrency = $(obj).find(".hidden_currency").text()
        if (strAmount != "")
        {
          fAmount = ((Number(strAmount) / objCurrency[strOldCurrency]) * objCurrency[sCur])
          fAmount = Math.round(fAmount*100)/100
          $(obj).find(".donateamount").val(fAmount.toFixed(2))
        }
        $(obj).find(".hidden_currency").text(sCur)
      }
    }
  
    var iCount = 1
    if (type=="Item")  iCount = Number(obj.find(".donatecount1").val())
  
    if ( (fAmount != 0) && (iCount != 0) )
    {
      $(obj).find(".donatedisableoncebutton").css("display","none") 
      $(obj).find(".donatedisableaddtocartbutton").css("display","none") 
      $(obj).find(".changecurrency").css("display","block") 
      $(obj).find(".donatecurrency").css("display","none") 
  
   
      strFee = "Add " + (iCount * fAmount * .05).toLocaleString('en-US', {style:"currency", currency:sCur}) +  " to cover transaction fees"
      $(obj).find(".donatefeestext").text(strFee)
  
      var fTotal = fAmount * iCount;
      if ($(obj).find(".donatefeescheckbox").prop("checked")) fTotal = fTotal * 1.05;
  
      strTotal = "Total : " + fTotal.toLocaleString('en-US', {style:"currency", currency:sCur})
      if (recur) strTotal += " / Month"
     
      $(obj).find(".donatetotaltext").text(strTotal)
      $(obj).find(".donatefees").css("display","block")
  
      UpdateURL(obj)
  
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
  
  $(window).on('load', function() {
    sCur = getCookie("Currency") 
    if (sCur!="") SetAllCurrency(sCur)
  
  //  $(".donateform").each(function(i,obj) { 
  //    var strAmountObj = $(this).find("hidden_fixedamount")
  //    UpdateForm($(this))  
  //  })
  
  });  
    
  $(".donatecurrency").change(function()
    {
      if (bInSetAllCurrency) return;
  
      var sCur = $(this).val();
      document.cookie = "Currency=" + sCur + "; path=/; expires=Thu, 18 Dec 2100 12:00:00 UTC";
      SetAllCurrency(sCur)
   })
  
    $(".donatefeescheckbox").change(function()
    {
      var top = $(this).closest('.donateform');
      UpdateForm(top,true)
    })
  
    $(".donateamount").keyup(function(){
      var top = $(this).closest('.donateform');
      UpdateForm(top,true)
  })
  
  $(".donatecount1").keyup(function(){
    var top = $(this).closest('.donateform');
    UpdateForm(top,true)
  })
  
  $(".donatepurposedesc").click(function(){
    var top = $(this).closest('.donateform');
    PostToStripe(top)
    return;
  
  
    if ($(top).find(".donatepurposedesc").html().length > iMaxDescLen )
    {
      if ($(top).find(".donatedetails").css("display") == "block")
        $(top).find(".donatedetails").css("display","none") 
      else
        $(top).find(".donatedetails").css("display","block") 
    }
  })
  
  $(".donatedetails").click(function(){
    var top = $(this).closest('.donateform');
    $(top).find(".donatedetails").css("display","none") 
  })
  
  $(".changecurrency").click(function(){
    var top = $(this).closest('.donateform');
  
    $(top).find(".donatedisableoncebutton").css("display","block") 
    $(top).find(".donatedisableaddtocartbutton").css("display","block") 
    $(top).find(".changecurrency").css("display","none") 
    $(top).find(".donatecurrency").css("display","block") 
  })
  
  $(".donateaboutdropdown").click(function(){
    var top = $(this).closest('.donateform');
    $(top).find(".donateaboutlist").css("display","none") 
  })
  
  function PostToStripe(obj)
    {
  
      var strPurpose = obj.find(".donatepurpose").text();
      var strProductId = obj.find(".hidden_productid").text();
      var strPurposeDesc = obj.find(".donatepurposedesc").text();
  //    var strNote = obj.find(".donatetextnode:first").val();
      var numAmount = Number(obj.find(".donateamount").val());
      var strCurrency = obj.find(".donatecurrency").val();
      var bFee = obj.find(".donatefeescheckbox").is(":checked");
      var strsrcset = obj.find(".donateimage").attr("srcset")
      var strRecurring = "Monthly"
      
      if (bFee) numAmount = numAmount * 1.05;
      
      var arr = strsrcset.split(" ")
      var strImage = arr[0];
  
      console.log("Purpose:" + strPurpose)
      console.log("ProductId:" + strProductId)
      console.log("PurposeDesc:" + strPurposeDesc)
      console.log("Amount:" + numAmount);
      console.log("Currency:" + strCurrency);
      console.log("Image:" + strImage); 
  
      var postData = {purpose:strPurpose,
                      productid:strProductId,
                      productdesc:strPurposeDesc,
                      amount: numAmount,
                      currency: strCurrency,
                      image: strImage
                    }
   
  
     $.ajax({
        url: 'https://8080-cs-395420509800-default.cs-asia-east1-vger.cloudshell.dev',
        method: 'POST',
        crossDomain: true,
        "headers": {
          "accept": "application/json",
          "Access-Control-Allow-Origin":"*"
        },
  
        success: function(data) {
            console.log("Success:" + data)
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching data:', textStatus, errorThrown);
        }
      })
  
  
  /*      fetch("https://8080-cs-395420509800-default.cs-asia-east1-vger.cloudshell.dev/", {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
  //        credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "text/plain"
            },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: "adfasdf" //JSON.stringify(postData),
        })
          .then((response) => response.json())
          .then((json) => console.log(json));
  */
  
  
  //    http://localhost:8080/checkout?price=33&currency=USD&productId//=abc123&recurring=false&testmode=true&productName//=test%20product%202&productDesc=product%20desc&productImage=https//://uploads-ssl.webflow.com/6450a9cc9922531a77060624//6450f9e2f06dfe0538467cb6_Volunteer%20-%20Feeding.jpg&customText=
  //    
  
  //      console.log(" https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms)
  //   $("#donationAmount").prop('value', 'One moment...');
  //     window.location = " https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms
      
      
    
    }
    
    
    function UpdateURL(obj)
    {
  
      var strPurpose = obj.find(".donatepurpose").text();
      var strProductId = obj.find(".hidden_productid").text();
      var strPurposeDesc = obj.find(".donatepurposedesc").text();
  //    var strNote = obj.find(".donatetextnode:first").val();
      var numAmount = Number(obj.find(".donateamount").val());
      var strCurrency = obj.find(".donatecurrency").val();
      var bFee = obj.find(".donatefeescheckbox").is(":checked");
      var strsrcset = obj.find(".donateimage").attr("srcset")
      var strRecurring = "Monthly"
      
      if (bFee) numAmount = numAmount * 1.05;
      
      var arr = strsrcset.split(" ")
      var strImage = arr[0];
  
      console.log("Purpose:" + strPurpose)
      console.log("ProductId:" + strProductId)
      console.log("PurposeDesc:" + strPurposeDesc)
      console.log("Amount:" + numAmount);
      console.log("Currency:" + strCurrency);
      console.log("Image:" + strImage); 
  
      var parms = "testmode=true" + "&"
                    + "price=" + numAmount + "&"
                + "currency=" + strCurrency + "&"
                + "recurring=" + strRecurring + "&"
                      + "productId=" + strProductId + "&"
                      + "productName="   + encodeURIComponent(strPurpose) + "&" 
                      + "productDesc=" + encodeURIComponent(strPurposeDesc) + "&"
                      + "productImage=" + encodeURIComponent(strImage)
        
   //   var strServer = "https://stripe-gateway-cti4ktuxta-uc.a.run.app"
      var strServer = "https://8080-cs-395420509800-default.cs-asia-east1-vger.cloudshell.dev"
      var strURL = strServer + "/checkout?" + parms
  
  console.log(strURL)
  
  //    http://localhost:8080/checkout?price=33&currency=USD&productId//=abc123&recurring=false&testmode=true&productName//=test%20product%202&productDesc=product%20desc&productImage=https//://uploads-ssl.webflow.com/6450a9cc9922531a77060624//6450f9e2f06dfe0538467cb6_Volunteer%20-%20Feeding.jpg&customText=
  //    
  
  //      console.log(" https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms)
  //   $("#donationAmount").prop('value', 'One moment...');
  //     window.location = " https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms
      
      
    
    }  
  
    
  /*
  
    var sRecurType, sPriceType, sCountType;
  
  var sFreq,sCur,sSym,sExchangeRate
  
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
  
  function getSlug()
  {
      var url = window.location.pathname
     var varUrl = url.split('/');
      return varUrl[varUrl.length-1]
    }
  
  function UpdatePricing()
  {
      $(".d_form").each(function(i, obj) {
        var sPrice
        if (sPriceType=="Fixed")
          {
            sPrice = $(this).find(".d_dataprice").text()
            sPrice = sPrice * sExchangeRate
            if (sFreq == "/year") sPrice = Number(sPrice) * 12
            $(this).find(".d_pricetext").text(sPrice)
          }
          else
            sPrice = $(this).find(".d_priceinput").val()
  
          $(this).find(".d_fees > .w-form-label").text("Add " + sSym + (Number(sPrice) * .027).toFixed(2) + " to cover credit card fee.")
      });
  }
  
  function UpdateInfo()
  {
      sFreq = $("#d_DropdownFreq").val()
  
      var cur = $("#d_DropdownCurrency").val().split(",")
      sSym = cur[0]
      sExchangeRate = cur[1]
  
      $(".d_pricesym").text(sSym)
      $(".d_pricecurrency").text(sCur)
      $(".d_pricefreq").text(sFreq)
      UpdatePricing()
  }
  
  $("#d_DropdownFreq").change(function() {UpdateInfo();})
  $("#d_DropdownCurrency").change(function()
    {
      sCur = $( "#d_DropdownCurrency option:selected" ).text();
      document.cookie = "Currency=" + sCur + "; path=/; expires=Thu, 18 Dec 2100 12:00:00 UTC";
    
      UpdateInfo();
    })
  
  $(window).on('load', function() {
    // Default currency to the cookie
    sCur = getCookie("Currency") 
    $("#d_DropdownCurrency option:contains(" + sCur + ")").attr('selected', 'selected');
  
    $(".d_form").each(function(i, obj) {
      sPriceType = $(this).find(".d_datapricetype").text()
      console.log(sPriceType)
      $(this).find(".d_pricetext").css("display",(sPriceType=="Fixed")?"block":"none")
      $(this).find(".d_priceinput").css("display",(sPriceType=="Fixed")?"none":"block")
    })
  
    sCountType = $("#d_CountType").text()
    if ($(".d_form").length == 1)
      {
        $(".d_selectbutton").css("display","none")
        $(".d_finalbuttondiv").css("display","block")
      }   
    else
      {
        $(".d_selectbutton").css("display","block")
        $(".d_finalbuttondiv").css("display","none")
      }  
  
    sRecurType = $("#d_RecurType").text()
    if (sRecurType=="Only") 
    {
      $("#d_DropdownFreq").val("/month")
      $("#d_DropdownFreq option[value='']").remove();
    }
      UpdateInfo()
      UpdatePricing()
  
  });
      
  $(".d_priceinput").keyup(function(){
        var top = $(this).closest('.d_form');
        sPrice = $(top).find('.d_priceinput').val();
        UpdatePricing()
  })
  
  
  $(".d_selectbutton").click(function(){
    var top = $(this).closest('.d_form');
   
    $(".d_selectbutton").css("display","block")
    $(".d_finalbuttondiv").css("display","none")
    $(top).find('.d_finalbuttondiv').css("display","block")
    $(top).find(".d_selectbutton").css("display","none")
  })
  
  $(".d_button").click(function(){
      var top = $(this).closest('.d_form');
      var sPrice = bFixed?$(top).find(".d_pricetext").text():$(top).find(".d_priceinput").val()
      var sButtonType = $(this).text()
  
      var sSlug = getSlug();
      var sImageUrl = $("#d_MainImage").attr('src');
      var sDesc = $("#d_MainDesc").text() + " : " + $("#d_MainDesc").text()
  
      console.log("sFreq=" + sFreq )
      console.log("sCur=" + sCur)
      console.log("sPrice=" + sPrice)
      console.log("sButtonType=" + sButtonType)
      console.log("sSlug=" + sSlug)
      console.log("sImage=" + sImageUrl)
      console.log("sDesc=" + sDesc)
  
  })
  
  /*$(top).find("$donateitemimage").attr('src');
  $("#selectpurposedrop").click(function() {
      console.log("test")
      var container = $("#selectpurposecontainer")
      
      container.css("display", (container.css("display") === "none")?"block":"none");
      $("#donateblock").css("display",(container.css("display") === "none")?"block":"none")
      $("#purposeblock").css("display",(container.css("display") === "none")?"block":"none")
  });
    
    
  var colDesignation
  var colSlug
  var colImage
  var colNeedShortDesc
  var colDesc
  var colDonationType
    
  $("#transactionFeeCheckboxContainer").css("visibility", "hidden");
  
  $("#donationAmount").on('keyup', function() {
      
    var strNum = $("#donationAmount").val()
  
    var amt = ((Math.round(parseFloat(strNum) * 100) / 100)*.05).toFixed(2);
    $("#transactionFeeText").text("Add " + amt + " to your donation to cover transaction fees")
  
    if (amt>1)
        $("#transactionFeeCheckboxContainer").css("visibility", "visible");
    else
        $("#transactionFeeCheckboxContainer").css("visibility", "hidden");
    
  })
    
    
  function getData(p)
    {
      var designation = p.find('.col_designation').text()
      console.log("clicked : " + designation)
      console.log("before : " + $("#donationDesignation").text())
       $("#donationDesignation").text(designation)
      console.log("after : " +$( "#donationDesignation").text())
  
      
      $("#donationDesc").text(p.find('.col_desc').text())
       $("#donationSlug").text(p.find('.col_slug').text())
       $("#donationImage").attr("src", p.find('.col_image').attr("src"))
       
      if (p.find('.col_image').attr("srcset") != undefined)
          $("#donationImage").attr("srcset", p.find('.col_image').attr("srcset"))
      else
          $("#donationImage").attr("srcset", "")
        
    
      console.log(p.find('.col_image').attr("src"))
      console.log(p.find('.col_image').attr("srcset"))
      
    
    }
    
  
  function showInvalid(myControl,bValid)
    {
      if (!bValid)
          myControl.css("border","2px solid red");
      else
          myControl.css("border","1px solid #dad4d4");
        
  //    myControl.animate({backgroundColor: 'red'}, 1000)
                        //function() {
       // myControl.animate({backgroundColor: 'white'}, 1000);});  
    }
    
                      
    
    
  $("#donateButton").click(function(){
    var amt = $("#donationAmount").val();
    
    var regex = /^(?!-)\d+(\.\d{1,2})?$/;
    var bAmount = regex.test(amt);
  
    showInvalid($("#donationAmount"),bAmount);
    
    if (!bAmount) 
        {$("#donationAmount").focus(); document.getElementById("donationAmount").scrollIntoView();} 
  
    if (bAmount)
    {
        var amount = $("#donationAmount").val();
        var currency = $("#donationCurrency").val();
        var recurring = $("#donationRecurring").prop("checked");
        var transactionfee = $("#donationTransactionFee").prop("checked");
        var designation = "where-most-need"
        var desc = $("#donationDesc").text();
        var image = $("#donationImage").attr('src');
        var slug = "where-most-need"
      
          console.log("amount:"+amount)
        console.log("currency:"+currency)
        console.log("recurring:"+recurring)
        console.log("transactionfee:"+transactionfee)
        console.log("designation:"+designation)
        console.log("desc:"+desc)
        console.log("image:"+image)
        console.log("slug:"+slug)
    
        var parms = "testmode=true" + "&"
                    + "price=" + amount + "&"
                  + "currency=" + currency + "&"
                  + "recurring=" + recurring + "&"
                    + "productId=" + slug + "&"
                    + "productName="   + encodeURIComponent(designation) + "&" 
                    + "productDesc=" + encodeURIComponent(desc) + "&"
                    + "productImage=" + encodeURIComponent(image)
        
    
  //    http://localhost:8080/checkout?price=33&currency=USD&productId//=abc123&recurring=false&testmode=true&productName//=test%20product%202&productDesc=product%20desc&productImage=https//://uploads-ssl.webflow.com/6450a9cc9922531a77060624//6450f9e2f06dfe0538467cb6_Volunteer%20-%20Feeding.jpg&customText=
  //    
  
        console.log(" https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms)
     $("#donationAmount").prop('value', 'One moment...');
       window.location = " https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms
      
    }
    
    
  });  
    
    
    
    
  /*
  -----------------------
    old code
  */  
    
    
  /*
  
    var sRecurType, sPriceType, sCountType;
  
  var sFreq,sCur,sSym,sExchangeRate
  
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
  
  function getSlug()
  {
      var url = window.location.pathname
     var varUrl = url.split('/');
      return varUrl[varUrl.length-1]
    }
  
  function UpdatePricing()
  {
      $(".d_form").each(function(i, obj) {
        var sPrice
        if (sPriceType=="Fixed")
          {
            sPrice = $(this).find(".d_dataprice").text()
            sPrice = sPrice * sExchangeRate
            if (sFreq == "/year") sPrice = Number(sPrice) * 12
            $(this).find(".d_pricetext").text(sPrice)
          }
          else
            sPrice = $(this).find(".d_priceinput").val()
  
          $(this).find(".d_fees > .w-form-label").text("Add " + sSym + (Number(sPrice) * .027).toFixed(2) + " to cover credit card fee.")
      });
  }
  
  function UpdateInfo()
  {
      sFreq = $("#d_DropdownFreq").val()
  
      var cur = $("#d_DropdownCurrency").val().split(",")
      sSym = cur[0]
      sExchangeRate = cur[1]
  
      $(".d_pricesym").text(sSym)
      $(".d_pricecurrency").text(sCur)
      $(".d_pricefreq").text(sFreq)
      UpdatePricing()
  }
  
  $("#d_DropdownFreq").change(function() {UpdateInfo();})
  $("#d_DropdownCurrency").change(function()
    {
      sCur = $( "#d_DropdownCurrency option:selected" ).text();
      document.cookie = "Currency=" + sCur + "; path=/; expires=Thu, 18 Dec 2100 12:00:00 UTC";
    
      UpdateInfo();
    })
  
  $(window).on('load', function() {
    // Default currency to the cookie
    sCur = getCookie("Currency") 
    $("#d_DropdownCurrency option:contains(" + sCur + ")").attr('selected', 'selected');
  
    $(".d_form").each(function(i, obj) {
      sPriceType = $(this).find(".d_datapricetype").text()
      console.log(sPriceType)
      $(this).find(".d_pricetext").css("display",(sPriceType=="Fixed")?"block":"none")
      $(this).find(".d_priceinput").css("display",(sPriceType=="Fixed")?"none":"block")
    })
  
    sCountType = $("#d_CountType").text()
    if ($(".d_form").length == 1)
      {
        $(".d_selectbutton").css("display","none")
        $(".d_finalbuttondiv").css("display","block")
      }   
    else
      {
        $(".d_selectbutton").css("display","block")
        $(".d_finalbuttondiv").css("display","none")
      }  
  
    sRecurType = $("#d_RecurType").text()
    if (sRecurType=="Only") 
    {
      $("#d_DropdownFreq").val("/month")
      $("#d_DropdownFreq option[value='']").remove();
    }
      UpdateInfo()
      UpdatePricing()
  
  });
      
  $(".d_priceinput").keyup(function(){
        var top = $(this).closest('.d_form');
        sPrice = $(top).find('.d_priceinput').val();
        UpdatePricing()
  })
  
  
  $(".d_selectbutton").click(function(){
    var top = $(this).closest('.d_form');
   
    $(".d_selectbutton").css("display","block")
    $(".d_finalbuttondiv").css("display","none")
    $(top).find('.d_finalbuttondiv').css("display","block")
    $(top).find(".d_selectbutton").css("display","none")
  })
  
  $(".d_button").click(function(){
      var top = $(this).closest('.d_form');
      var sPrice = bFixed?$(top).find(".d_pricetext").text():$(top).find(".d_priceinput").val()
      var sButtonType = $(this).text()
  
      var sSlug = getSlug();
      var sImageUrl = $("#d_MainImage").attr('src');
      var sDesc = $("#d_MainDesc").text() + " : " + $("#d_MainDesc").text()
  
      console.log("sFreq=" + sFreq )
      console.log("sCur=" + sCur)
      console.log("sPrice=" + sPrice)
      console.log("sButtonType=" + sButtonType)
      console.log("sSlug=" + sSlug)
      console.log("sImage=" + sImageUrl)
      console.log("sDesc=" + sDesc)
  
  })
  
  /*$(top).find("$donateitemimage").attr('src');
  $("#selectpurposedrop").click(function() {
      console.log("test")
      var container = $("#selectpurposecontainer")
      
      container.css("display", (container.css("display") === "none")?"block":"none");
      $("#donateblock").css("display",(container.css("display") === "none")?"block":"none")
      $("#purposeblock").css("display",(container.css("display") === "none")?"block":"none")
  });
    
    
  var colDesignation
  var colSlug
  var colImage
  var colNeedShortDesc
  var colDesc
  var colDonationType
    
  $("#transactionFeeCheckboxContainer").css("visibility", "hidden");
  
  $("#donationAmount").on('keyup', function() {
      
    var strNum = $("#donationAmount").val()
  
    var amt = ((Math.round(parseFloat(strNum) * 100) / 100)*.05).toFixed(2);
    $("#transactionFeeText").text("Add " + amt + " to your donation to cover transaction fees")
  
    if (amt>1)
        $("#transactionFeeCheckboxContainer").css("visibility", "visible");
    else
        $("#transactionFeeCheckboxContainer").css("visibility", "hidden");
    
  })
    
    
  function getData(p)
    {
      var designation = p.find('.col_designation').text()
      console.log("clicked : " + designation)
      console.log("before : " + $("#donationDesignation").text())
       $("#donationDesignation").text(designation)
      console.log("after : " +$( "#donationDesignation").text())
  
      
      $("#donationDesc").text(p.find('.col_desc').text())
       $("#donationSlug").text(p.find('.col_slug').text())
       $("#donationImage").attr("src", p.find('.col_image').attr("src"))
       
      if (p.find('.col_image').attr("srcset") != undefined)
          $("#donationImage").attr("srcset", p.find('.col_image').attr("srcset"))
      else
          $("#donationImage").attr("srcset", "")
        
    
      console.log(p.find('.col_image').attr("src"))
      console.log(p.find('.col_image').attr("srcset"))
      
    
    }
    
  
  function showInvalid(myControl,bValid)
    {
      if (!bValid)
          myControl.css("border","2px solid red");
      else
          myControl.css("border","1px solid #dad4d4");
        
  //    myControl.animate({backgroundColor: 'red'}, 1000)
                        //function() {
       // myControl.animate({backgroundColor: 'white'}, 1000);});  
    }
    
                      
    
    
  $("#donateButton").click(function(){
    var amt = $("#donationAmount").val();
    
    var regex = /^(?!-)\d+(\.\d{1,2})?$/;
    var bAmount = regex.test(amt);
  
    showInvalid($("#donationAmount"),bAmount);
    
    if (!bAmount) 
        {$("#donationAmount").focus(); document.getElementById("donationAmount").scrollIntoView();} 
  
    if (bAmount)
    {
        var amount = $("#donationAmount").val();
        var currency = $("#donationCurrency").val();
        var recurring = $("#donationRecurring").prop("checked");
        var transactionfee = $("#donationTransactionFee").prop("checked");
        var designation = "where-most-need"
        var desc = $("#donationDesc").text();
        var image = $("#donationImage").attr('src');
        var slug = "where-most-need"
      
          console.log("amount:"+amount)
        console.log("currency:"+currency)
        console.log("recurring:"+recurring)
        console.log("transactionfee:"+transactionfee)
        console.log("designation:"+designation)
        console.log("desc:"+desc)
        console.log("image:"+image)
        console.log("slug:"+slug)
    
        var parms = "testmode=true" + "&"
                    + "price=" + amount + "&"
                  + "currency=" + currency + "&"
                  + "recurring=" + recurring + "&"
                    + "productId=" + slug + "&"
                    + "productName="   + encodeURIComponent(designation) + "&" 
                    + "productDesc=" + encodeURIComponent(desc) + "&"
                    + "productImage=" + encodeURIComponent(image)
        
    
  //    http://localhost:8080/checkout?price=33&currency=USD&productId//=abc123&recurring=false&testmode=true&productName//=test%20product%202&productDesc=product%20desc&productImage=https//://uploads-ssl.webflow.com/6450a9cc9922531a77060624//6450f9e2f06dfe0538467cb6_Volunteer%20-%20Feeding.jpg&customText=
  //    
  
        console.log(" https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms)
     $("#donationAmount").prop('value', 'One moment...');
       window.location = " https://kidsim-stripe-5qpi5j2ynq-uc.a.run.app/checkout?" + parms
      
    }
    
    
  });  
  */