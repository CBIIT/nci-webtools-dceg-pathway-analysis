$(function() {
    $("#calculate").on("click", clickCalculate);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

   
    $("button").button();

    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);
});

$(window).load(function() {
    $("select[name='database_pathway'], input[name='file_pathway']")
        .on("change", changeRadioSelection);
});

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
           
            if(el.id.indexOf("study") > -1) numStudies++;

           
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


var serviceBase = window.location.hostname + "/Pathway/";
$(function(){
    var count = 2;
    var hold = function() {
      count--;
      if (count <= 0)
        post_request();
    };
   
    retrieve_pathways().then(apply_options($(pathForm.database_pathway)), get_options_error("pathway")).always(hold);
    retrieve_populations().then(apply_options($(pathForm.population)), get_options_error("population")).always(hold);
});

function pre_request() {
   
    $("#spinner").show();

   
    $(pathForm).find(":input").prop("disabled",true);
    $("button").button("disable");
}

function post_request() {
   
    $("button#calculate").show();
    $("progress, #spinner").hide();

   
    $("button").button("enable");
    $(pathForm).find(":input").removeAttr("disabled");
}

function submission_result(response) {
    console.log(response.data);

    if(response.success){
       
       
        $( "#successBox #message" ).text(response.message);
        $( "#successBox").show();
        document.querySelector("#successBox").scrollIntoView(true);

        setTimeout(function(){
            $( "#successBox" ).fadeOut().hide();
            $( "#successBox #message" ).html("");
        }, 10000);

    }
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
    displayErrors("#errorDisplay",
                  ["The request failed with the following message: <br/> "+ request.responseText + "'"]);
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




$(window).on('load', function(){
    $(".addControl")
        .button({text: true, icons: {primary: "ui-icon-circle-plus"}})
        .on("click", function(e){
        e.preventDefault();

        var previousValid = false;
        var validator = $(pathForm).validate();
        $(pathForm).find(".studies input").each(function(i, el) {
            previousValid = validator.element("#" + el.id);
            return previousValid;
        });

        if(previousValid)
            addStudy();
    });

    addStudy();// add first element by default

    function addStudy() {
       
        var studyTemplate = $("#snippets").find(".studies").clone();

       
        var studyCount = $("form .studies").length;
        var studyIndex = studyCount + 1;

        studyTemplate.find(".studyTitle").append(studyIndex);

        studyTemplate.find("label, input").each(function(i, el) {
            if(this.tagName.toLowerCase() == "label") {
                var forAttr = $(el).attr("for") + "_" + studyIndex;
                $(el).attr("for", forAttr);
            }
            if(this.tagName.toLowerCase() == "input") {
                var newId = $(el).attr("id") + "_" + studyIndex;
                $(el).attr("id", newId).attr("name", newId);
            }
        });

       
        $("#studyEntry").append(studyTemplate);

        $("#studyEntry .studies:last")
            .find("input[id*='num_resource']")
            .on("change", function(e) {
            if(Number(this.value)) {
                $("#studyEntry .studies:last .studyResources").remove();

                for(var i = 0; i != this.value; i++) {
                   
                   
                    $($(this).parent().parent()[0]).append(
                        addStudyResource($(this).prop('id').substr(13),(i+1))
                    );
                }
            }
        });






        $(pathForm).find(".studies:last")
            .find("input, select")
            .each(function(i, el) {
            if(this.type != "file") {
                $(this).rules("add", {
                    required: true,
                    number: true,
                    min: 1,
                    messages: {
                        required: "The " + this.id + " field is required",
                        number: "The " + this.id + " value must be a number",
                        min: "The " + this.id + " value must be greater than or equal to 1"
                    }
                });
            }
            else {
                $(this).rules("add", {
                    required: true,
                    file_type_check: "study",
                    messages: {
                        required: "The " + this.id + " field is required",
                    }
                });
            }
        });

       
        $("#studyEntry").accordion( "refresh" );

        if(studyCount >= 1){
            $("#studyEntry").accordion({
                active: studyCount
            });
        }
    }

    function addStudyResource(study,ind) {
        var resource_element = $("#snippets").find(".studyResources").clone();
        var elementLabel = resource_element.find("label");
        var elementInput = resource_element.find("input");

        var LabelFor = elementLabel.attr("for") + "_" + ind;
        var labelText = elementLabel[0].innerHTML + " #" + ind + ":";

        var inputId = elementInput.attr("id") + "_" + study + "_" + ind;

        elementLabel.attr("for", LabelFor);
        elementLabel.text(labelText);
        elementInput.attr("id", inputId).attr("name", inputId);

        return resource_element;
    }

    function removeStudyResource(parentElement, ind) {
       
        parentElement.find(".studyResources:nth(" + ind + ") input").each(function(){
            $(this).rules("remove");
            $(this).remove();
        });
    }
});

var terms = {
    "study":{
        fullName:"",
        definition:"Upload one or more study files containing the summary results of SNPs. The file must contain the following columns: 'SNP', 'RefAllele', 'EffectAllele', 'BETA', and at least one of 'SE', 'P'."
    },
    "file_pathway":{
        fullName:"",
        definition:"Select from existing pathways or upload a file containing the definition of a pathway"
    },
    "population":{
        fullName:"",
        definition:"Select a population from the list."
    },
    "nperm": {
        fullName:"Number of Permutations",
        definition:"The number of permutations. The default is 1E5."
    },
    "lambda": {
        fullName:"Lambda",
        definition: "Lambda to be adjusted in pathway analysis. The default is 1.0."
    },
    "miss_rate": {
        fullName:"SNP Miss Rate",
        definition:"any SNP with missing rate greater than snp.miss.rate will be removed from the analysis. The default is 0.05."
    },
    "maf": {
        fullName:"maf",
        definition:"any SNP with minor allele frequency less than maf will be removed from the analysis. The default is 0.05."
    },
    "hwep": {
        fullName:"HWE.p",
        definition:"any SNP with HWE exact p-value less than HWE.p will be removed from the analysis. The test is applied to the reference data. The default is 1E-5."
    },
    "gene": {
        fullName:"Gene.R2",
        definition:"a number between 0 and 1 to filter out SNPs that are highly correlated within each gene. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than gene.R2. The default is 0.95."
    },
    "chr": {
        fullName:"Chr.R2",
        definition:"a number between 0 and 1 to filter out SNPs that are highly correlated within each chromosome. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than chr.R2. The default is 0.95."
    },
    "gene_subset": {
        fullName:"rm.gene.subset",
        definition:"TRUE to remove genes which are subsets of other genes. The default is TRUE."
    },
    "snp_n": {
        fullName: "inspect.snp.n",
        definition: "The number of candidate truncation points to inspect the top SNPs in a gene. The default is 5."
    },
    "snp_percent": {
        fullName: "inspect.snp.percent",
        definition: "A value x between 0 and 1 such that a truncation point will be defined at every x percent of the top SNPs. The default is 0 so that the truncation points will be 1:inspect.snp.n."
    },
    "gene_n": {
        fullName: "inspect.gene.n",
        definition: "The number of candidate truncation points to inspect the top genes in the pathway. The default is 10."
    },
    "gene_percent": {
        fullName: "inspect.gene.percent",
        definition: "a value x between 0 and 1 such that a truncation point will be defined at every x percent of the top genes. If 0 then the truncation points will be 1:inspect.gene.n. The default is 0.05."
    }
};












$(function() {
    $.extend($_Glossary, terms);







    $(document).on("click",
                   ".termToDefine",
                   termDisplay);
});

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

   
   
    jQuery.validator.setDefaults({
        ignore: "button",
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
           
            var errors = this.numberOfInvalids();
            if (errors > 0 && errorList.length > 0) {
                var grammar = errors == 1 ? "is " + errors + " error" : "are " + errors + " errors";
                errors_div.html("<b>There " + grammar + ", see details below: </b>");
                this.defaultShowErrors();

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

   
    $(pathForm).validate({
        rules: validationElements,
        messages: validationMessages,
    });

   
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
