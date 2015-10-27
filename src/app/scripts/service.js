// handle sevice call and actions here
var serviceBase = window.location.hostname + "/Pathway/";

function pre_request() {
    // display spinner
    $("#spinner").show();

    // disable controls
    $(pathForm).find(":input").prop("disabled",true);
}

function submission_result(data) {
    console.log(data);
    // display confirmation message
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

function post_request() {
    // hide progressbar and spinner
    $("button#calculate").show();
    $("progress, #spinner").hide();

    // enable controls
    $(pathForm).find(":input").removeAttr("disabled");
}

function sendForm() {
    var formData = new FormData(pathForm);

//    $.each(pathForm, function(ind,el) {
//        var key = el.id;
//
//        if(el.type == "file")
//            formData.append(key, ind, el.files);
//        if(el.type == "text" || el.type == "select")
//            formData.append(key, el.value);
//        if(el.type == "checkbox")
//            formData.append(key, el.checked);
//    });

    return $.ajax({
        url: pathForm.action,
        type: pathForm.method,
        beforeSend: pre_request,
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
        data: formData,
        processData: false,
        dataType: "json",
        cache: false
    }).then(submission_result,submission_error).always(post_request);
}

function retrieve_pathways(){
        return $.ajax({
        url: "/options/pathway_options",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    }).then(apply_options, get_options_error).always(post_request);
}
