$(function () {
    var errors_div = $("#errorDisplay");
    $.validator.addMethod("boundedMax", function (value, element, params) {
        return value < params;
    });

    // custom validator for scientific notation
    jQuery.validator.addMethod('scientific_notation_check', function (value, el) {
        return (typeof Number(value) === "number");
    });

    jQuery.validator.addMethod('csFormat', function (value, el) {
        var values = value.split(",");
        var valid = false;
        for (var i = 0; values.length > i; i++) {
            if(typeof Number(values[i]) === "number") {
                valid = true;
                return valid;
            }
        }

        return valid;
    });

    var validationElements = {
        database_pathway: {
            required: {
                depends: function (element) {
                    return $("#database_pathway_option").is(":checked");
                }
            }
        },
        file_pathway: {
            required: {
                depends: function (element) {
                    return $("#file_pathway_option").is(":checked");
                }
            }
        },
        super_population: {
            required: true
        },
        population: {
            required: {
                depends: function (element) {
                    return element.value.length === 0 && document.getElementById("super_population").value.length > 0;
                }
            }
        },
        nperm: {
            required: true,
            scientific_notation_check: true,
            max: Number(1e7)
        },
        hwep: {
            required: true,
            min: 0,
            boundedMax: 1,
            scientific_notation_check: true
        },
        lambda: {
            required: true,
            min: 1
        },
        miss_rate: {
            required: true,
            scientific_notation_check: true,
            min: 0,
            boundedMax: 1
        },
        gene: {
            required: true,
            scientific_notation_check: true,
            range: [0, 1]
        },
        maf: {
            required: true,
            scientific_notation_check: true,
            range: [0, 0.5]
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
            min: 0,
            boundedMax: 1
        },
        email: {
            required: true,
            email: true
        }
    };

    var validationMessages = {
        study: {
            required: "You must upload at least one study file",
            extension: "You uploaded an incorrect file type. Please upload only .study files."
        },
        file_pathway: {
            required: "You must upload a pathway file",
        },
        database_pathway: {
            required: "You must select a pathway from the server",
        },
        super_population: {
            required: "You must select a super population",
        },
        population: {
            required: "You must select at least one sub population",
        },
        nperm: {
            required: "nperm is required",
            scientific_notation_check: "The value you entered for nperm is invalid. The value must be a floating number or in scientific notation.",
            max: "The value for nperm must be less than or equal to 1e7 (10,000,000)."
        },
        lambda: {
            required: "Lambda is required",
            min: "The value you entered for lambda is invalid. The value must be a greater than or equal to 1."
        },
        miss_rate: {
            required: "snp.miss.rate is required",
            scientific_notation_check: "The value you entered for snp.miss.rate is invalid. The value must be a floating number or in scientific notation.",
            min: "The value you entered for snp.miss.rate is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1.",
            boundedMax: "The value you entered for snp.miss.rate is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1."
        },
        maf: {
            required: "maf is required",
            range: "The value you entered for maf is invalid. The value must be a floating number not less than 0 OR not greater than 0.5.",
            scientific_notation_check: "The value you entered for maf is invalid. The value must be a floating number or in scientific notation."
        },
        hwep: {
            required: "HWE.p is required",
            min: "The value you entered for HWE.p is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1.",
            boundedMax: "The value you entered for HWE.p is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1.",
            scientific_notation_check: "The value you entered for HWE.p is invalid. The value must be a floating number or in scientific notation."
        },
        gene: {
            required: "Gene.R2 is required",
            range: "The value you entered for Gene.R2 is invalid. The value must be a floating number not less than 0 OR not greater than 1.",
            scientific_notation_check: "The value you entered for Gene.R2 is invalid. The value must be a floating number or in scientific notation."
        },
        chr: {
            required: "Chr.R2 is required",
            range: "The value you entered for Chr.R2 is invalid. The value must be a floating number not less than 0 OR not greater than 1.",
            scientific_notation_check: "The value you entered for Chr.R2 is invalid. The value must be a floating number or in scientific notation."
        },
        snp_n: {
            required: "inspect.snp.n is required",
            min: "The value you entered for inspect.snp.n is invalid. The value must not be less than 1."
        },
        snp_percent: {
            required: "inspect.snp.percent is required",
            range: "The value you entered for inspect.snp.percent is invalid. The value must be a floating number not less than 0 OR not greater than 1."
        },
        gene_n: {
            required: "inspect.gene.n is required",
            min: "The value you entered for inspect.gene.n is invalid. The value must not be less than 1."
        },
        gene_percent: {
            required: "inspect.gene.percent is required",
            min: "The value you entered for inspect.gene.percent is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1.",
            boundedMax: "The value you entered for inspect.gene.percent is invalid. The value must be a floating number not less than 0 OR not greater than or equal to 1."
        },
        email: {
            required: "An E-Mail address is required",
            email: "Enter a valid E-Mail address"
        }
    };

    // since there will be multiple validations eventually
    // there should be some default settings that all forms follow
    jQuery.validator.setDefaults({
        ignore: ".custom-combobox-input",
        focusInvalid: false,
        focusCleanup: true,
        ignoreTitle: true,
        errorElement: "li",
        errorLabelContainer: "#errorDisplay",
        errorPlacement: function (error, element) {
            errors_div.find("ul").append(error);
            $(element).addClass("error");
        },
        showErrors: function (errorMap, errorList) {
            // 'this' refers to the form
            var errors = this.numberOfInvalids();
            if (errors > 0 && errorList.length > 0) {
                var grammar = errors == 1 ? "is " + errors + " error" : "are " + errors + " errors";
                errors_div.html("<b>There " + grammar + ", see details below: </b>");
                this.defaultShowErrors();

                errors_div.addClass('show');
            } else {
                $(pathForm).find('input,select').removeClass('error');
                errors_div.removeClass('show').empty();
            }
        }
    });

    // specific validations only for pathForm
    $(pathForm).validate({
        ignore: ".custom-combobox *",
        rules: validationElements,
        messages: validationMessages,
        highlight: function (el, errorClass, validClass) {
            if(el.id.indexOf("sample_sizes") > -1 || el.id.indexOf("lambda") > -1 ) {
                $(el).addClass('error').parents(".studies").find(".panel-heading").addClass('error');
            }
            else if (el.id != "population" && el.name != "selectItempopulation" &&
                el.name != "selectAllpopulation") {
                $(el).addClass(errorClass);
            }
            else {
                $("#population").next().find('.ms-choice').children()
                    .andSelf().addClass(errorClass);
            }
        },
        unhighlight: function (el, errorClass, validClass) {
            if(el.id.indexOf("sample_sizes") > -1 || el.id.indexOf("lambda") > -1 ) {
                $(el).removeClass("error").parents(".studies").find(".panel-heading").removeClass('error');
            }
            else if (el.id != "population" && el.name != "selectItempopulation" &&
                el.name != "selectAllpopulation"){
                $(el).removeClass(errorClass);
            }
            else {
                $("#population").next().find('.ms-choice').children().andSelf().removeClass(errorClass);
            }
        }
    });
});
