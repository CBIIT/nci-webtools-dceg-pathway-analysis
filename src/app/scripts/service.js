// handle sevice call and actions here
var buttons = $("button").button();
var population_labels = {'AFR':{'fullName':'African','subPopulations':{'YRI':'Yoruba in Ibadan, Nigera','LWK':'Luhya in Webuye, Kenya','GWD':'Gambian in Western Gambia','MSL':'Mende in Sierra Leone','ESN':'Esan in Nigera','ASW':'Americans of African Ancestry in SW USA','ACB':'African Carribbeans in Barbados'}},'AMR':{'fullName':'Ad Mixed American','subPopulations':{'MXL':'Mexican Ancestry from Los Angeles, USA','PUR':'Puerto Ricans from Puerto Rico','CLM':'Colombians from Medellin, Colombia','PEL':'Peruvians from Lima, Peru'}},'EAS':{'fullName':'East Asian','subPopulations':{'CHB':'Han Chinese in Bejing, China','JPT':'Japanese in Tokyo, Japan','CHS':'Southern Han Chinese','CDX':'Chinese Dai in Xishuangbanna, China','KHV':'Kinh in Ho Chi Minh City, Vietnam'}},'EUR':{'fullName':'European','subPopulations':{'CEU':'Utah Residents from North and West Europe','TSI':'Toscani in Italia','FIN':'Finnish in Finland','GBR':'British in England and Scotland','IBS':'Iberian population in Spain'}},'SAS':{'fullName':'South Asian','subPopulations':{'GIH':'Gujarati Indian from Houston, Texas','PJL':'Punjabi from Lahore, Pakistan','BEB':'Bengali from Bangladesh','STU':'Sri Lankan Tamil from the UK','ITU':'Indian Telugu from the UK'}}};

$(function() {
  var count = 2;
  var hold = function() {
      count--;
      if (count <= 0) post_request();
  };
  // retrive options from server
  retrieve_pathways().then(apply_options($(pathForm.database_pathway)), get_options_error("pathway")).always(hold);
  retrieve_populations().then(apply_options($(pathForm.super_population), population_labels), get_options_error("super population")).always(hold);

  function pre_request() {
    // display spinner
    $("#spinner").show();

    // disable controls
    $(pathForm).find(":input").prop("disabled",true);
    buttons.button("disable");
  }

  function post_request() {
    // hide progressbar and spinner
    $("button#calculate").show();
    $("progress, #spinner").hide();

    // enable controls
    buttons.button("enable");
    $(pathForm).find(":input").removeAttr("disabled");
  }

  function sendForm(formData) {
    return $.ajax({
      beforeSend: pre_request,
      type: pathForm.method,
      url: pathForm.action,
      data: formData,
      cache: false,
      processData: false,
      contentType: false,
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener("progress", function(other) {
            if (other.lengthComputable) {
              $("progress").attr({value:other.loaded,max:other.total});
            }
          }, false);
        }
        return myXhr;
      },
      dataType: "json"
    });
  }

  function retrieve_pathways(){
    return $.ajax({
      url: "pathway_options.json",
      type: "GET",
      beforeSend: pre_request,
      contentType: "application/json",
      dataType: "json",
      cache: false
    });
  }

  function retrieve_populations(){
    return $.ajax({
      url: "population_options.json",
      type: "GET",
      beforeSend: pre_request,
      contentType: "application/json",
      dataType: "json",
      cache: false
    });
  }

  function submission_result(response) {
    if(response.success){
      resetForm();

      // display confirmation message
      $( "#successBox #message" ).text(response.message);
      $( "#successBox").show();
      document.querySelector("#successBox").scrollIntoView(true);

      setTimeout(function(){
        $( "#successBox" ).fadeOut().hide();
        $( "#successBox #message" ).html("");
      }, 10000);
    }
  }

  function apply_options(element, items, combo){
    var source = [];
    if (typeof items === 'undefined') {
      return function(data) {
        data.forEach(function(item, i) {
          var option = $("<option></option>");
          $(option).val(item.code);
          $(option).text(item.text);
          element.append(option);

          source.push({label: item.text, value: item.code, option: option});
        });
        if(data.length > 10)
          element.select2({
              placeholder:"Type to filter or select from dropdown",
              allowClear: true
          });
      };
    }
    else {
      return function() {
        $.each(items, function(key, item) {
          var option = $("<option></option>");
          $(option).val(key);
          $(option).text(item.fullName);
          element.append(option);
          source.push({label: item.fullName, value: key, option: option});
        });
        if(items.length > 10)
          element.select2({
              placeholder:"Type to filter or select from dropdown",
              allowClear: true
          });
      };
    }
  }

  function submission_error(request, statusText, error) {
    var errorObj = JSON.parse(request.responseText);

    displayErrors("#errorDisplay",
            ["The request failed with the following message: <br/> "+ errorObj.message]);
  }

  function get_options_error(option_type) {
    return function(request, statusText, error) {
      displayErrors("#errorDisplay",
            ["There was a problem retrieving the " + option_type + " options from the server. Try again later."]);
    };
  }
});
