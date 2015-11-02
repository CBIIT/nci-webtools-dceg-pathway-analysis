$(function(){

    var errors_div = $("#errorDisplay");
    var validationElements = {
        study: {
            required: true
        },
        database_pathway: {
            required: {
                depends:function(element) {
                    return $("#database_pathway_option").is(":checked");
                }
            }
        },
        file_pathway: {
            required: {
                depends:function(element) {
                    return $("#file_pathway_option").is(":checked");
                }
            },
            file_type_check: {
                param: "pathway",
                depends:function(element) {
                    return $("#file_pathway_option").is(":checked");
                }
            }
        },
        nperm:{
            required: true,
            scientific_notation_check: true,
            max: Number(1e7)
        },
        hwep:{
            required: true,
            range: [0,1],
            scientific_notation_check: true
        },
        lambda: {
            required: true,
            min: 1
        },
        miss_rate: {
            required: true,
            scientific_notation_check: true,
            range: [0,1]
        },
        gene: {
            required: true,
            scientific_notation_check: true,
            range: [0, 1]
        },
        maf: {
            required: true,
            scientific_notation_check: true,
            range: [0,0.5]
        },
        chr: {
            required: true,
            scientific_notation_check: true,
            range: [0, 1]

        },
        snp_percent: {
            required: true,
            number: true,
            range: [0, 1]
        },
        snp_n: {
            required: true,
            min: 1
        },
        gene_n: {
            required: true,
            min: 1
        },
        gene_percent: {
            required: true,
            range: [0,1]
        },
        email: {
            required: true,
            email: true
        }
    };

    var validationMessages = {
        study: {
            required: "You must upload atleast one study file",
            extension: "You uploaded an incorrect file type. Please upload only .study files."
        },
        file_pathway:{
            required: "You must upload a pathway file",
        },
        database_pathway:{
            required: "You must select a pathway from the server",
        },
        nperm:{
            required: "nperm is required",
        },
        lambda: {
            required: "Lambda is required",
        },
        miss_rate: {
            required: "snp.miss.rate is required",//decimal"
        },
        maf: {
            required: "maf is required",//decimal"
        },
        hwep:{
            required: "HWE.p is required",
        },
        gene: {
            required: "Gene.R2 is required",//decimal"
        },
        chr: {
            required: "Chr.R2 is required",//decimal"
        },
        snp_n: {
            required: "inspect.snp.n is required",//integer
        },
        snp_percent: {
            required: "inspect.snp.percent is required",//decimal"
        },
        gene_n: {
            required: "inspect.gene.n is required",//integer
        },
        gene_percent: {
            required: "inspect.gene.percent is required",
        },
        email: {
            required: "An E-Mail address is required",
            email: "Enter a valid E-Mail address"
        }
    };

    // since there will be multiple validations eventually
    // there should be some default settings that all forms follow
    jQuery.validator.setDefaults({
        ignore: [],
        focusInvalid: false,
        focusCleanup: true,
        ignoreTitle: true,
        errorElement: "li",
        errorLabelContainer: "#errorDisplay",
        errorPlacement: function(error, element) {
            errors_div.find("ul").append(error);
            $(element).addClass("ui-state-error");
        },
        showErrors: function(errorMap, errorList) {
            // 'this' refers to the form
            var errors = this.numberOfInvalids();
            if (errors > 0) {
                var grammar = errors == 1 ? "is " + errors + " error" : "are " + errors + " errors";

                errors_div.html("<b>There " + grammar + ", see details below: </b><ul></ul>");
                for(var i = 0;i< errors;i++) {
                    errors_div.find("ul").append("<li>"+ errorList[i].message + "</li>");
                }
                //                this.defaultShowErrors();

                errors_div.show();
                document.querySelector("#errorDisplay").scrollIntoView(true);
            } else {
                $(pathForm).find('input,select').removeClass('ui-state-error');
                errors_div.hide().empty();
            }
        },
        highlight: function (el, errorClass,validClass) {
            $(el).addClass("ui-state-error");
        },
        unhighlight: function (el, errorClass,validClass) {
            $(el).removeClass("ui-state-error");
        }
    });

    // specific validations only for pathForm
    $(pathForm).validate({
        rules: validationElements,
        messages: validationMessages,
    });

    // custom validator for scientific notation
    jQuery.validator.addMethod('scientific_notation_check', function(value, el) {
        if(Number(value))
            return true;
        return false;
    }, jQuery.validator.format('The value you entered for {0} is invalid. The value must be a floating number or in scientific notation.'));

    jQuery.validator.addMethod('comma_delim_numerical_check', function(valuesString, el) {
        var valid = false;
        var separated = valuesString.split(",");

        separated.forEach(function(value, ind){
            if(!Number(value)){
                valid = false;
            }
            else {
                valid = true;
            }
            return valid;
        });

        return valid;
    }, jQuery.validator.format("One or more of the values in {0} is invalid. Value must be an integer or string of integers separated by commas"));

    jQuery.validator.addMethod('file_type_check', function(elementValue, el, validExtension) {
        var splitFilename = el.files[0].name.split(".");
        var splitFilenameLength = splitFilename.length;
        var fileExtension = splitFilename[splitFilenameLength - 1];

        return fileExtension == validExtension || fileExtension == "txt" ;
    }, jQuery.validator.format("You must upload a valid (.{0} or .txt) file."));

});
