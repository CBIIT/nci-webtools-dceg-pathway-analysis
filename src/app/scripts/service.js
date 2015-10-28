// handle sevice call and actions here
var serviceBase = window.location.hostname + "/Pathway/";
$(function(){
    // retrive options from server
    retrieve_pathways().then(apply_options, get_options_error).always(post_request);
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
        $( "#successBox #message" ).text("Your submission was successful.");
        $( "#successBox").show();
        document.querySelector("#successBox").scrollIntoView(true);

        setTimeout(function(){
            $( "#successBox" ).fadeOut().hide();
            $( "#successBox #message" ).html("");
        }, 3000);

    }
}

function apply_options(data){
    data.forEach(function(item, i) {
        var option = $("<option></option>");

        $(option).val(item.code);
        $(option).text(item.text);

        $(pathForm.database_pathway).append(option);
    });
}

function submission_error(request, statusText, error) {
    displayErrors("#errorDisplay", ["The request failed with a status of '" + request.status + "' and a(n) '" + statusText + "' of '" + error + "'"]);
}

function get_options_error(request, statusText, error) {
    displayErrors("#errorDisplay", ["There was a problem retrieving the pathway options from the server. Try again later."]);
}

function sendForm() {
    var formData = new FormData(pathForm);
    var numStudies = 0;

    $.each(pathForm, function(ind, el) {
        // get a count of studies and append to formData
        if(el.id.indexOf("study") > -1) numStudies++;

        // have to manually add checkbox value to FormData object
        if(el.type == "checkbox") formData.append(el.id, el.checked);
    });

    formData.append('num_studies', numStudies);

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
        url: "/options/pathway_options",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}
