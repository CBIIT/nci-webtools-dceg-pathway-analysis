$(function () {
    var errors_div = $("#errorDisplay");
    $.validator.addMethod("boundedMax", function (value, element, params) {
        return value < params;
    });

   
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


var pathways_list = [];

var population_labels = {
    'AFR': {
        'fullName':'African',
        'subPopulations':{
            'YRI':'Yoruba in Ibadan, Nigera',
            'LWK':'Luhya in Webuye, Kenya',
            'GWD':'Gambian in Western Gambia',
            'MSL':'Mende in Sierra Leone',
            'ESN':'Esan in Nigera',
            'ASW':'Americans of African Ancestry in SW USA',
            'ACB':'African Carribbeans in Barbados'
        }
    },
    'AMR': {
        'fullName':'Ad Mixed American',
        'subPopulations':{
            'MXL':'Mexican Ancestry from Los Angeles, USA',
            'PUR':'Puerto Ricans from Puerto Rico',
            'CLM':'Colombians from Medellin, Colombia',
            'PEL':'Peruvians from Lima, Peru'
        }
    },
    'EAS':{
        'fullName':'East Asian',
        'subPopulations':{
            'CHB':'Han Chinese in Bejing, China',
            'JPT':'Japanese in Tokyo, Japan',
            'CHS':'Southern Han Chinese',
            'CDX':'Chinese Dai in Xishuangbanna, China',
            'KHV':'Kinh in Ho Chi Minh City, Vietnam'
        }
    },
    'EUR':{
        'fullName':'European',
        'subPopulations':{
            'CEU':'Utah Residents from North and West Europe',
            'TSI':'Toscani in Italia',
            'FIN':'Finnish in Finland',
            'GBR':'British in England and Scotland',
            'IBS':'Iberian population in Spain'
        }
    },
    'SAS':{
        'fullName':'South Asian',
        'subPopulations':{
            'GIH':'Gujarati Indian from Houston, Texas',
            'PJL':'Punjabi from Lahore, Pakistan',
            'BEB':'Bengali from Bangladesh',
            'STU':'Sri Lankan Tamil from the UK',
            'ITU':'Indian Telugu from the UK'
        }
    }
};

function pre_request() {
   
    $("#spinner").addClass('show');

   
    $(pathForm).find(":input").prop("disabled",true);
    $('button.ui-button').button("disable");
}

function post_request() {
   
    $("button#calculate").addClass('show');
    $("progress, #spinner").removeClass('show');

   
    $('button.ui-button').button("enable");
    $(pathForm).find(":input").removeAttr("disabled");
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
        url: "pathway_options.json",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}

function retrieve_populations(){
    return $.ajax({
        url: "population_options.json",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}

function submission_result(response) {
    if(response.success){
        resetForm();

       
        $( "#successBox #message" ).text(response.message);
        $( "#successBox").addClass('show');
        document.querySelector("#successBox").scrollIntoView(true);

        setTimeout(function(){
            $( "#successBox" ).fadeOut().removeClass('show');
            $( "#successBox #message" ).html("");
        }, 10000);
    } else {
      submission_error({"responseText": JSON.stringify(response)},200);
    }
}

function apply_options(element, items){
    var source = [];
    if (typeof items === 'undefined') {
        return function(data) {
            $(element).attr("placeholder", data.length + " existing pathways");
            data.forEach(function(item, i) {
                var option = $("<option></option>");
                item.text = item.text.replace(/_/g," ");

                pathways_list.push(item.text);

                source.push({ value: item.code, label: item.text });
            });

            $(element).autocomplete({
                source: source,
                minLength: 0
            });
        };
    } else {
        return function(data) {
            var populations = {};
            data.forEach(function(item, i) {
                populations[item.group] = populations[item.group] || (items[item.group]?{fullName:items[item.group].fullName,subPopulations:{}}:{fullName:item.group,subPopulations:{}});
                populations[item.group].subPopulations[item.subPopulation] = items[item.group].subPopulations[item.subPopulation] || item.text;
            });
            population_labels = populations;
            $.each(population_labels, function(key, item) {
                var option = $("<option></option>");
                $(option).val(key);
                $(option).text('(' + key + ') ' + item.fullName);
                element.append(option);
                source.push({label: item.fullName, value: key, option: option});
            });
        };
    }
}

function submission_error(request, statusText, error) {
    var errorMessage;
    if (error === "timeout") {
        errorMessage = "The calculation service appears to be down. Please try again later or contact the administrator.";
    } else {
        if (request.status == 500) {
            errorMessage = "An unknown error occurred. The service may be unavailable. Please try again later or contact the administrator.";
        } else {
            errorMessage = "The request failed with the following message: <br/> "+ JSON.parse(request.responseText).message;
        }
        displayErrors("#errorDisplay",[errorMessage]);
    }
}

function get_options_error(option_type) {
    return function(request, statusText, error) {
        displayErrors("#errorDisplay",
                      ["There was a problem retrieving the " + option_type + " options from the server. Try again later."]);
    };
}

$(function() {
    $("button").button();
    var count = 2;
    var hold = function() {
        count--;
        if (count <= 0) post_request();
    };
   
    retrieve_pathways().then(apply_options($(pathForm.database_pathway)), get_options_error("pathway")).then(function(){
        if(pathways_list.length > 0){
            $("#pop-list").addClass("termToDefine");
            $('#dialogElm').html(pathways_list.join("<br />"));

            $('#dialogElm').dialog({
                autoOpen: false,
                position: { my: "left center", at: "left bottom", of: "#pop-list" },
                title: "Existing Pathways",
                width: 400,
                maxWidth: 400,
                height: 300,
                maxHeight: 300
            });

            $(document).on("click", "#pop-list", function() {
                $('#dialogElm').dialog("open");
            });
        }
    }).always(hold);
    retrieve_populations().then(apply_options($(pathForm.super_population), population_labels), get_options_error("super population")).always(hold);


});







$(function () {
    $("#integrityUpload").on('click', function(e) {
        $("input#studyFiles").trigger('click');
    });

    $('#studyFiles').fileupload({
        url: 'integrity/',
        type: 'POST',
        dataType: 'json',
        maxNumberOfFiles: 10,
        singleFileUploads: false,
        progressInterval: 50,
        acceptFileTypes: /(\.|\/)(zip|tar|tar?.gz)$/i,
        formData: function(form) {
            return [{
                name: "family",
                value: form[0].family.value
            }];
        },
        add: function(e, data) {
            console.log(e);
            console.log(data);
            paramIds = [];
            $.each(data.paramName, function(i, param){
                paramIds.push(param + "_" + (i + 1));
            });

            data.paramName = paramIds;

            data.submit();
        },
        start: function () {
            $("#studySelections").empty().html('<div><img src="/common/images/loading.gif"></span></div>');
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            var progressBar = '<div class="progress-bar progress-bar-striped active" ' +
            'role="progressbar" aria-valuenow="' + progress + '" aria-valuemin="0" aria-valuemax="100" ' +
            'style="width: '+ progress +'%"><span class="sr-only">'+ progress +'% Complete</span></div>';

           
            if(progress == 100) {
                $("#uploadStatus").empty().removeClass('progress').addClass('form-control').html("");
            }
            else {
                $("#uploadStatus").removeClass('form-control').addClass('progress').html(progressBar);
            }
        },
        fail: function (e, data) {
            $("#studySelections").empty();
        },
        done: function (e, data) {
            $("#studySelections").empty();
            if(data.result.success) {
               
                addStudy(data.files, data.result);
            }
        }
    });
});

function addStudy(studyFiles, studyData) {
    console.log('in addStudy');
    console.log(studyData);

    var studyNum = studyFiles.length;

    for (var i = 0; i < studyNum; i++) {
        var studyInd = i + 1;
        var newStudy = $("#snippets .studies").clone();
        newStudy.find('.panel-heading').attr('id', "studyHeading-" + studyInd);
        newStudy.find("a.panel-title").attr("href", "#study-" + studyInd).attr("aria-controls", "study-" + i).find("b").html(studyFiles[i].name + " (Study #" + studyInd + ")");
        newStudy.find(".panel-collapse").attr("id", "study-" + studyInd);

        var resources = studyData.message[i].resources;

        addStudyResource(studyInd, resources, newStudy);

        $("#studySelections").append(newStudy);

        var inputLambda = $("input#lambda_" + studyInd);
        var inputSamples = $("textarea#sample_sizes_" + studyInd);

        var lambdaRules = {
            required: true,
            messages: {
                required: "Lambda for Study #" + studyInd + " is required",
            }
        };
        
        var sampleSizeRules = {
            required: true,
            csFormat: true,
            messages: {
                required: "Sample Sizes for Study #" + studyInd + " are required",
                csFormat: "Sample Sizes for Study #" + studyInd + " are in invalid format"
            }
        };

        $(inputLambda).rules("add", lambdaRules);
        $(inputSamples).rules("add", sampleSizeRules);
    }

    $("#studySelections").collapse();
    $("#studySelections").on('hidden.bs.collapse', toggleChevron).on('shown.bs.collapse', toggleChevron);
}

function addStudyResource(studyNum, resources, studyElm) {
    if(resources > 0) {
        studyElm.find("#lambda").attr('id', 'lambda_' + studyNum).attr('name', 'lambda_' + studyNum);
        studyElm.find("#sample_sizes").attr('id', 'sample_sizes_' + studyNum).attr('name', 'sample_sizes_' + studyNum).attr("placeholder", "Enter sample sizes for (" + resources + ") resource(s) (separated by comma):")
        .attr("aria-label", "Enter sample sizes for (" + resources + ") resource(s) separated by comma");

        studyElm.find(".studyResources span").html("Enter sample sizes for </b>(" + resources + ")</b> resource(s) (separated by comma):");
    }

    return studyElm;
}

function removeStudy(ind) {
    console.log('in removeStudy');
}

function toggleChevron(e) {
    var ico =$(e.target).prev('.panel-heading').find("i.toggleIcons");
    if(e.type == "hidden")
        ico.addClass('glyphicon-chevron-left').removeClass('glyphicon-chevron-down');
    if(e.type == "shown")
        ico.addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-left');
}
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
    $(document).on("click", ".termToDefine", termDisplay);
});

function checkedStateToValue(e) {
  return $(this).val(this.checked);
}

function resetForm() {
  $(pathForm).find(".studies").each(function(i, el) {
    if(i !== 0) {
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

  $(pathForm).validate().resetForm();
  $('#population').parent().removeClass('show');
  $(pathForm).find("button,input,select,div,span").removeClass("error");
}

function clickCalculate(e) {
  e.preventDefault();
  $(pathForm).validate();
  var proceed = $(pathForm).valid();

  if (proceed) {
    $(pathForm).find('.error').each(function( ind,el) {
      $(el).removeClass('error');
    });
    $("#calculate").removeClass('show');
    $("progress").addClass('show');

    var formData = new FormData(pathForm);
    var numStudies = 0;

    $.each(pathForm, function(ind, el) {
      if( $(el).is("hidden") &&
      el.id.indexOf("population") > -1 &&
      el.name.indexOf("population") > -1 &&
      el.id.indexOf("database_pathway") > -1) { return true;}

     
      if(el.id.indexOf("study") > -1) numStudies++;

     
      if(el.type == "checkbox"){
        if(el.checked && el.id)
        formData.append(el.id, el.checked);
      }
    });

    formData.append('populations', $('#population').val());
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
    var groupCode = $('#population').find("option[value='" + item + "']")
    .parent().attr("label");

   
   
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

  $(el).addClass('show');
  document.querySelector(el).scrollIntoView(true);
}

function apply_multiselect_options(element, group){
  element.html("");
  if(group.length > 0){
    $.each(population_labels[group].subPopulations, function (subCode, text) {
      element.append($("<option />", { value: group + "|" + subCode, text: '(' + subCode + ') ' + text }));
    });

   
    element.multipleSelect({
      name: element.prop('id'),
      width: 400,
      placeholder: "Select Sub Population(s)",
      selectAll: true,
      minimumCountSelected: 2,
      countSelected: false,
      onClick:function(view) {
        element.validate();
      }
    });
    element.multipleSelect("refresh").multipleSelect("uncheckAll");
    $('#sub').addClass('show');
  } else {
    $('#sub').removeClass('show');
  }
}

function changeRadioSelection() {
  $("#database_pathway, #file_pathway").valid();
  $("input[name='pathway_type'][value='" + this.name + "']")
  .prop("checked", true);
}

$(function() {
  $(pathForm).on('keyup keypress', function(e) {
   
    var code = e.keyCode || e.which;
    if (code == 13) {
      e.preventDefault();
      return false;
    }
  });

  $("#calculate").on("click", clickCalculate);
  $("#reset").on("click", resetForm);
  $("#errorDisplay, #successBox,progress").removeClass('show');
 
 
 
 
 

 
  $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);

  $("select[name='database_pathway'], input[name='file_pathway']").on("change", changeRadioSelection);

  $("select#super_population").on('change', function() {
    apply_multiselect_options($('#population'), this.value);
  });

 
 
});
