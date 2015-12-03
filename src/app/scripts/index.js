$(function() {
    $(pathForm).on('keyup keypress', function(e) {
        // disable enter key submitting form
        var code = e.keyCode || e.which;
        if (code == 13) {
            e.preventDefault();
            return false;
        }
    });

    $("#calculate").on("click", clickCalculate);
    $("#reset").on("click", resetForm);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

    // initialize button using jquery ui

    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);
    function checkedStateToValue(e) {
        return $(this).val(this.checked);
    }

    function resetForm() {
        $(pathForm).find(".studies").each(function(i, el) {
            if(i !== 0) $(this).detach();
            else {
                $(lambda_1).val("1.0");
                $(num_resource_1, pathForm.study_1).val("");
                $(study_1).wrap("<form>").closest("form").get(0).reset();
                $(study_1).unwrap();
                $(pathForm).find(".studyResources").detach();
            }
        });

        $(database_pathway_option).attr("checked", "checked");
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
        $(".custom-combobox input").val("");
        $(population).html("");
        $(refinep)[0].checked = false;
        $(gene_subset)[0].checked = false;
        $(database_pathway_option)[0].checked = true;
        $(database_pathway).find("option:first-child").attr("selected", "selected");
        $(super_population).find("option:first-child").attr("selected", "selected");
        $(file_pathway).wrap("<form>").closest("form").get(0).reset();
        $(file_pathway).unwrap();

        $(pathForm).validate().resetForm();
        $(population.parentElement).addClass('hide');
        $(pathForm).find("button,input,select,div,span").removeClass("error");

        $("#studyEntry").accordion("option", "active", 0);
    }

    function clickCalculate(e) {
        e.preventDefault();
        $(pathForm).validate();
        var proceed = $(pathForm).valid();

        if (proceed) {
            $(pathForm).find('.error').each(function( ind,el) {
                $(el).removeClass('error');
            });
            $("#calculate").hide();
            $("progress").show();

            var formData = new FormData(pathForm);
            var numStudies = 0;

            $.each(pathForm, function(ind, el) {
                if( $(el).is("hidden") &&
                   el.id.indexOf("population") > -1 &&
                   el.name.indexOf("population") > -1 &&
                   el.id.indexOf("database_pathway") > -1) { return true;}

                // get a count of studies and append to formData
                if(el.id.indexOf("study") > -1) numStudies++;

                // have to manually add checkbox value to FormData object
                if(el.type == "checkbox"){
                    if(el.checked && el.id)
                        formData.append(el.id, el.checked);
                }
            });

            formData.append('populations', $(pathForm.population).val());
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
            var groupCode = $(population).find("option[value='" + item + "']")
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

    function displayErrors(el, messagesArray){
        $(el).empty();

        messagesArray.forEach(function(message, index){
            $(el).append(message + "<br />");
        });

        $(el).show();
        document.querySelector(el).scrollIntoView(true);
    }
});

$(window).load(function() {
    $("select[name='database_pathway'], input[name='file_pathway']")
        .on("change", changeRadioSelection);

    $("select#super_population").on('change', function() {
        apply_multiselect_options(
            $(population),
            this.value);

    });
    
    function apply_multiselect_options(element, group){
      element.html("");

      $.each(population_labels[group].subPopulations, function (subCode, text) {
        var subOption = $("<option />", { value: group + "|" + subCode, text: text });

        element.append(subOption).multipleSelect('refresh');
        element.multipleSelect("uncheckAll");
      });

      // setting options for the multiselect control
      element.multipleSelect({
        name: population.id,
        width: "100%",
        placeholder: "Select Sub Population(s)",
        selectAll: true,
        multiple: true,
        multipleWidth: 300,
        minimumCountSelected: 2,
        countSelected: false,
        onClick:function(view) {
            element.validate();
        }
      });
      element.multipleSelect("refresh");
      $(population_labels[0]).show();
      element.parent().removeClass('hide');
    }

    function changeRadioSelection(){
        $("input[name='pathway_type'][value='" + this.name + "']")
            .prop("checked", true);
    }

});
