function checkedStateToValue(e) {
    return $(this).val(this.checked);
}

function resetForm() {
    $(pathForm).find(".studies").each(function (i, el) {
        if (i !== 0) {
            $(this).remove();
        } else {
            $('#lambda_1').val("1.0");
            $('#study_1').val("");
            $('#study_1').wrap("<form>").closest("form").get(0).reset();
            $('#study_1').unwrap();
            $('#num_resource_1').val("1");
            $(pathForm).find(".studyResources:not(:first)").remove();
            $(pathForm).find(".studyResources input").val("");
        }
    });

    $('#database_pathway_option').attr("checked", "checked");
    $('#nperm').val((1e5).toExponential());
    $('#miss_rate').val(0.05);
    $('#maf').val(0.05);
    $('#hwep').val((1e-5).toExponential());
    $('#gene').val(0.95);
    $('#chr').val(0.95);
    $('#snp_n').val(5);
    $('#snp_percent').val(0);
    $('#gene_n').val(10);
    $('#gene_percent').val(0.05);
    $('#email').val("");
    $(".custom-combobox input").val("");
    $('#population').html("");
    $('#refinep')[0].checked = false;
    $('#gene_subset')[0].checked = false;
    $('#database_pathway_option')[0].checked = true;
    $('#database_pathway').val("").trigger('change');
    $('#super_population').val(0).trigger('change');
    $('#file_pathway').wrap("<form>").closest("form").get(0).reset();
    $('#file_pathway').unwrap();

    $('#population').parent().addClass('hide');
    $(pathForm).find("button,input,select,div,span").removeClass("error");
    $(pathForm).validate().resetForm();
    $("#messageBox").removeClass("alert-danger show");
    
}

function clickCalculate(e) {
    e.preventDefault();
    $(pathForm).validate();
    var proceed = $(pathForm).valid();

    if (proceed) {
        $(pathForm).find('.error').each(function (ind, el) {
            $(el).removeClass('error');
        });
        $("#calculate").removeClass('show');
        $("progress").addClass('show');

        var formData = new FormData(pathForm);
        var numStudies = 0;

        $.each(pathForm, function (ind, el) {
            if ($(el).is("hidden") &&
                el.id.indexOf("population") > -1 &&
                el.name.indexOf("population") > -1 &&
                el.id.indexOf("database_pathway") > -1) {
                return true;
            }

            // get a count of studies and append to formData
            if (el.id.indexOf("study") > -1) numStudies++;

            // have to manually add checkbox value to FormData object
            if (el.type == "checkbox") {
                if (el.checked && el.id)
                    formData.append(el.id, el.checked);
            }
        });

        formData.append('populations', $('#population').val());
        formData.append('num_studies', numStudies);

        sendForm(formData).then(submission_result, submission_error)
            .always(post_request);
    } else {
        document.querySelector("#messageBox").scrollIntoView(true);
    }
}

function retrieveMultiselects(selectedItems) {
    var valuesContainer = {};

    $.each(selectedItems, function (i, item) {
        var groupCode = $('#population').find("option[value='" + item + "']")
            .parent().attr("label");

        // Add values in the population group
        // if population group doesn't exist, create it.
        if (!valuesContainer[groupCode])
            valuesContainer[groupCode] = [item];
        else
            valuesContainer[groupCode].push(item);
    });

    return valuesContainer;
}

function displayErrors(el, messagesArray) {
    $(el).empty();

    messagesArray.forEach(function (message, index) {
        $(el).append(message + "<br />");
    });
    
    if(messagesArray.length > 0) {
        $(el).addClass("alert-danger show");
        document.querySelector(el).scrollIntoView(true);
    }
    else {
        $(el).removeClass("alert-danger show");
    }
}

function apply_multiselect_options(element, group) {
    element.html("");
    if (group.length > 0) {
        $.each(population_labels[group].subPopulations, function (subCode, text) {
            element.append($("<option />", {
                value: group + "|" + subCode,
                text: '(' + subCode + ') ' + text
            }));
        });

        // setting options for the multiselect control
        element.multipleSelect({
            name: element.prop('id'),
            width: 400,
            placeholder: "Select Sub Population(s)",
            selectAll: true,
            minimumCountSelected: 2,
            countSelected: false,
            onClick: function (view) {
                element.validate();
            }
        });
        element.multipleSelect("refresh").multipleSelect("uncheckAll");
        element.parent().removeClass('hide');
    } else {
        element.parent().addClass('hide');

    }
}

function changeRadioSelection() {
    $("#database_pathway, #file_pathway").valid();
    $("input[name='pathway_type'][value='" + this.name + "']")
        .prop("checked", true);
}

$(function () {
    $(pathForm).on('keyup keypress', function (e) {
        // disable enter key submitting form
        var code = e.keyCode || e.which;
        if (code == 13) {
            e.preventDefault();
            return false;
        }
    });

    $("#calculate").on("click", clickCalculate);
    $("#reset").on("click", resetForm);
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

    // initialize button using jquery ui
    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);

    $("select[name='database_pathway'], input[name='file_pathway']").on("change", changeRadioSelection);

    $("select#super_population").on('change', function () {
        apply_multiselect_options($('#population'), this.value);
    });

    $("#studyEntry").accordion("option", "active", 0);
    addStudy(); // add first element by default, function declaration in template-manager
});