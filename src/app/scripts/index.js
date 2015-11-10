$(function() {
    $("#calculate").on("click", clickCalculate);
    $("#reset").on("click", resetForm);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

    $(pathForm.population).multipleSelect({placeholder:" -- Select an existing pathway -- "});

    // initialize button using jquery ui
    $("button").button();

    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);

});

$(window).load(function() {
    $("select[name='database_pathway'], input[name='file_pathway']")
        .on("change", changeRadioSelection);
});

function resetForm(e) {

    $(pathForm).find(".studies").each(function(i, el) {
        if(i !== 0) $(this).detach();
        else {
            $(lambda_1).val(1.0);
            $(pathForm).find(".studyResources").detach();
        }
    });

    $(database_pathway_option).attr("checked", "checked");
    $("#population option:first").attr("selected", "selected");

    $(nperm).val((1e5).toExponential());
    $(miss_rate).val(0.05);
    $(maf).val(0.05);
    $(hwep).val((1e-5).toExponential());
    $(gene).val(0.95);
    $(chr).val(0.95);
    $(snp_n).val(5);
    $(snp_percent).val(0);
    $(gene_n).val(10);
    $(gene_percent).val(0.05);
    $(email).val("");
}

function clickCalculate(e) {
    e.preventDefault();
    $(pathForm).validate();
    var proceed = $(pathForm).valid();

    if (proceed) {
        $("#calculate").hide();
        $("progress").show();

        var formData = new FormData(pathForm);
        var numStudies = 0;

        $.each(pathForm, function(ind, el) {
            // get a count of studies and append to formData
            if(el.id.indexOf("study") > -1) numStudies++;

            // have to manually add checkbox value to FormData object
            if(el.type == "checkbox") formData.append(el.id, el.checked);
        });

        formData.append('num_studies', numStudies);

        sendForm(formData).then(submission_result, submission_error)
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
