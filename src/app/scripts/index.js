$(function() {
    $("#calculate").on("click", clickCalculate);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

    // initialize button using jquery ui
    $("button").button();

    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);
});

$(window).load(function() {
    $("select[name='database_pathway'], input[name='file_pathway']")
        .on("change", changeRadioSelection);
});

function clickCalculate(e) {
        e.preventDefault();
        var proceed = $(pathForm).valid();

        if (proceed) {
            $("#calculate").hide();
            $("progress").show();
            sendForm().then(submission_result, submission_error)
                .always(post_request);
        }
}

function changeRadioSelection(){
    $("input[name='pathway_type'][value='" + this.name + "']")
        .prop("checked", true);
}

function checkedStateToValue(e) {
    return $(this).val(this.checked);
}

function displayErrors(el, messagesArray){
    $(el).empty();

    messagesArray.forEach(function(message, index){
        $(el).append(message + "<br />");
    });

    $(el).show();
    document.querySelector(el).scrollIntoView(true);
}
