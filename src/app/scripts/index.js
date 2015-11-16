$(function() {
    $("#calculate").on("click", clickCalculate);
    $("#reset").on("click", resetForm);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

    // setting options for the multiselect control
    $(pathForm.population).multipleSelect(
        {
            name: pathForm.population.id,
            width: "100%",
            placeholder:"Select Population(s)",
            selectAll: true,
            allSelected: "All Populations",
            multiple: true,
            multipleWidth: 300,
            minimumCountSelected: 2,
            countSelected: false
        });

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
    $(population).multipleSelect("uncheckAll");

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

    $(pathForm).validate().resetForm();
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
            if( $(el).is("hidden") || el.id == "selectGrouppopulation") return;

            // get a count of studies and append to formData
            if(el.id.indexOf("study") > -1) numStudies++;

            // have to manually add checkbox value to FormData object
            if(el.type == "checkbox"){
                if(el.id.indexOf("selectItempopulation") > -1) {
                    populations = retrieveMultiselects($(el).multipleSelect("getSelects"));
                    formData.append("populations", populations );
                    return;
                }
                if(el.id && el.id != "population")
                    formData.append(el.id, el.checked);
            }
        });

        formData.append('num_studies', numStudies);

        sendForm(formData).then(submission_result, submission_error)
            .always(post_request);
    }
    else {
        document.querySelector("#errorDisplay").scrollIntoView(true);
    }
}

function retrieveMultiselects(selectedItems) {
    var valuesContainer = {};

    $.each(selectedItems, function(i, item) {
        var groupCode = $(pathForm.population).find("option[value='" + item + "']")
            .parent().attr("label");

        // Add values in the population group
        // if population group doesn't exist, create it.
        if(!valuesContainer[groupCode])
            valuesContainer[groupCode] = [item];
        else
            valuesContainer[groupCode].push(item);
    });

    return valuesContainer;
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
