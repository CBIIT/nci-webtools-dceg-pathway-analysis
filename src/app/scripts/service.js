// handle sevice call and actions here
var serviceBase = window.location.hostname + "/Pathway/";
$(function(){
    var count = 2;
    var hold = function() {
        count--;
        if (count <= 0)
            post_request();
    };
    // retrive options from server
    retrieve_pathways().then(apply_options($(pathForm.database_pathway)), get_options_error("pathway")).always(hold);
    retrieve_populations().then(apply_multiselect_options($(pathForm.population)), get_options_error("population")).always(hold);
});

function pre_request() {
    // display spinner
    $("#spinner").show();

    // disable controls
    $(pathForm).find(":input").prop("disabled",true);
    $("button").button("disable");
}

function post_request() {
    // hide progressbar and spinner
    $("button#calculate").show();
    $("progress, #spinner").hide();

    // enable controls
    $("button").button("enable");
    $(pathForm).find(":input").removeAttr("disabled");
}

function submission_result(response) {
    console.log(response.data);

    if(response.success){
        // display confirmation message
        //$(pathForm).reset();
        $( "#successBox #message" ).text(response.message);
        $( "#successBox").show();
        document.querySelector("#successBox").scrollIntoView(true);

        setTimeout(function(){
            $( "#successBox" ).fadeOut().hide();
            $( "#successBox #message" ).html("");
        }, 10000);
    }
}

function apply_multiselect_options(element){
    return function(data) {
        data.forEach(function(item, i) {
            var option = $("<option />", { value: item.text, text: item.text });
            var optGroup = $("<optgroup label='" + item.code + "'/>");

            if($(element).find(optGroup).length)
                $(element).find(optGroup).append(option);
            else{
                optGroup.append(option);
                $(element).append(optGroup);
            }
            $(element).multipleSelect('refresh');
        });
    };
}

function apply_options(element){

    return function(data) {

        data.forEach(function(item, i) {
            var option = $("<option></option>");

            $(option).val(item.code);
            $(option).text(item.text);

            element.append(option);
        });
    };
}

function submission_error(request, statusText, error) {
    var errorObj = JSON.parse(request.responseText);
    
    displayErrors("#errorDisplay",
                  ["The request failed with the following message: <br/> "+ errorObj.message + "'"]);
}

function get_options_error(option_type) {
    return function(request, statusText, error) {
        displayErrors("#errorDisplay",
                      ["There was a problem retrieving the " + option_type + " options from the server. Try again later."]);
    };
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
        url: "/pathwayRest/options/pathway_options/",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}

function retrieve_populations(){
    return $.ajax({
        url: "/pathwayRest/options/population_options/",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}
