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
        population: {
            required: {
                depends: function(element) {
                    return element.value.length === 0;
                }
            },
            multiselect_group_check:true
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
        population:{
            required: "You must select at least one population",
            multiselect_group_check: "You selected populations from more than one super population group. Only populations from the same super population group can be selected at a time."
        },
        nperm:{
            required: "nperm is required",
            scientific_notation_check: "The value you entered for nperm is invalid. The value must be a floating number or in scientific notation.",
            max: "The value for nperm must be less than " + Number(1e7)
        },
        lambda: {
            required: "Lambda is required",
            min: "The value you entered for lambda is invalid. The value must be a greater than or equal to 1."
        },
        miss_rate: {
            required: "snp.miss.rate is required",
            scientific_notation_check: "The value you entered for snp.miss.rate is invalid. The value must be a floating number or in scientific notation.",
            range: "The value you entered for snp.miss.rate is invalid. The value must be a floating number between 0 and 1."
        },
        maf: {
            required: "maf is required",//decimal"
            range: "The value you entered for maf is invalid. The value must be a floating number between 0 and 0.5.",
            scientific_notation_check: "The value you entered for maf is invalid. The value must be a floating number or in scientific notation."
        },
        hwep:{
            required: "HWE.p is required",
            range: "The value you entered for HWE.p is invalid. The value must be a floating number between 0 and 1.",
            scientific_notation_check: "The value you entered for HWE.p is invalid. The value must be a floating number or in scientific notation."
        },
        gene: {
            required: "Gene.R2 is required",
            range: "The value you entered for Gene.R2 is invalid. The value must be a floating number between 0 and 1.",
            scientific_notation_check: "The value you entered for Gene.R2 is invalid. The value must be a floating number or in scientific notation."
        },
        chr: {
            required: "Chr.R2 is required",
            range: "The value you entered for Chr.R2 is invalid. The value must be a floating number between 0 and 1.",
            scientific_notation_check: "The value you entered for Chr.R2 is invalid. The value must be a floating number or in scientific notation."
        },
        snp_n: {
            required: "inspect.snp.n is required",
            min: "The value you entered for inspect.snp.n is invalid. The value must be a greater than or equal to 1."
        },
        snp_percent: {
            required: "inspect.snp.percent is required",//decimal"
        },
        gene_n: {
            required: "inspect.gene.n is required",
            min: "The value you entered for inspect.gene.n is invalid. The value must be a greater than or equal to 1."
        },
        gene_percent: {
            required: "inspect.gene.percent is required",
            range: "The value you entered for inspect.gene.percent is invalid. The value must be a floating number between 0 and 1."
        },
        email: {
            required: "An E-Mail address is required",
            email: "Enter a valid E-Mail address"
        }
    };

   
   
    jQuery.validator.setDefaults({
        ignore: ".ms-parent, .custom-combobox-input",
        focusInvalid: false,
        focusCleanup: true,
        ignoreTitle: true,
        errorElement: "li",
        errorLabelContainer: "#errorDisplay",
        errorPlacement: function(error, element) {
            errors_div.find("ul").append(error);
            $(element).addClass("error");
        },
        showErrors: function(errorMap, errorList) {
           
            var errors = this.numberOfInvalids();
            if (errors > 0 && errorList.length > 0) {
                var grammar = errors == 1 ? "is " + errors + " error" : "are " + errors + " errors";
                errors_div.html("<b>There " + grammar + ", see details below: </b>");
                this.defaultShowErrors();

                errors_div.show();
            } else {
                $(pathForm).find('input,select').removeClass('error');
                errors_div.hide().empty();
            }
        }
    });

   
    $(pathForm).validate({
        ignore: ".ms-parent *,.custom-combobox *",
        rules: validationElements,
        messages: validationMessages,
        highlight: function (el, errorClass,validClass) {
            if(el.id != "population" && el.id != "database_pathway")
                $(el).addClass(errorClass);
            else
                $(el).next().find('.select2, .ms-choice').addClass(errorClass);
        },
        unhighlight: function (el, errorClass,validClass) {
            if(el.id != "population" && el.id != "database_pathway")
                $(el).removeClass(errorClass);
            else
                $(el).next().find('.select2').children().andSelf().find('.error').removeClass(errorClass);
        }
    });

   
    jQuery.validator.addMethod('scientific_notation_check', function(value, el) {
        if(Number(value))
            return true;
        return false;
    });

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

        return fileExtension == validExtension || fileExtension == "txt" || fileExtension == "gz";
    }, jQuery.validator.format("You must upload a valid (.{0} or .txt) file."));

    jQuery.validator.addMethod('multiselect_group_check', function(values, el) {
        var single_group_code = values[0].split("|")[0];
        var valid = false;
        $.each(values,function(index, selectionValue) {
            var this_code = selectionValue.split("|")[0];
            valid = ( this_code == single_group_code ? true : false);

            if(valid){
                $(el).find('.error').removeClass('error');
                $('.ms-parent').find('.error').removeClass('error');
            }

            return valid;
        });
        return valid;
    });

});


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
 
  $("#spinner").show();

 
  $(pathForm).find(":input").prop("disabled",true);
  $('button.ui-button').button("disable");
}

function post_request() {
 
  $("button#calculate").show();
  $("progress, #spinner").hide();

 
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
    dataType: "json",
    timeout: 5000
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
    $( "#successBox").show();
    document.querySelector("#successBox").scrollIntoView(true);

    setTimeout(function(){
      $( "#successBox" ).fadeOut().hide();
      $( "#successBox #message" ).html("");
    }, 10000);
  }
}

function apply_options(element, items, combo){
  var source = [];
  if (typeof items === 'undefined') {
    return function(data) {
      data.forEach(function(item, i) {
        var option = $("<option></option>");
        $(option).val(item.code);
        $(option).text(item.text);
        element.append(option);

        source.push({label: item.text, value: item.code, option: option});
      });
      if (data.length > 10) {
        element.select2({
            dropdownParent: element.parent(),
            placeholder:"Type to filter or select from dropdown",
            allowClear: true
        });
      }
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
 
  retrieve_pathways().then(apply_options($(pathForm.database_pathway)), get_options_error("pathway")).always(hold);
  retrieve_populations().then(apply_options($(pathForm.super_population), population_labels), get_options_error("super population")).always(hold);
});



function addStudy() {
   
    var studyTemplate = $("#snippets").find(".studies").clone();

   
    var studyCount = $(pathForm).find(".studies").length;
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

    studyTemplate.find("input, select").each(function(i, el) {
        if(this.type == "file") {
            $(this).rules("add", {
                required: true,
                file_type_check: "study",
                messages: {
                    required: "The " + this.id + " field is required",
                }
            });
        }
        else {
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
    });

   
    var activeIndex = $("#studyEntry").accordion( "refresh" ).accordion({
        active: studyCount
    }).accordion("option", "active");

    studyTemplate.find("input[id*='num_resource']").on("change", function(e) {
        var id = $(this).prop('id');
        var valid = false;
        valid = $(this).validate().element('#'+id);
        if (valid) {
            var choice;
            if(this.value > 20)
                choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
            else
                choice = true;

            if(choice) {
                var resourceList = studyTemplate.find('ul.resource-list').empty();
                for(var i = 1; i <= this.value; i++) {
                   
                   
                    addStudyResource(id.substr(13),i).appendTo(resourceList);
                }
            }
        }
    });
    studyTemplate.find(".addControl[title='resource']").button({ text: false, icons: {primary: "ui-icon-circle-plus" }}).on("click", function(e) {
        e.preventDefault();

        var el = $(this);
        var previousValid = false;
        var resource_tb = $(this).prev();
        var validator = resource_tb.validate();

        previousValid = validator.element("#" + resource_tb.prop('id'));

        var resourceValue = resource_tb.val();

        if(previousValid){
            var resourceList = el.parent().next().empty();
            for(var i = 1; i <= resourceValue; i++) {
               
               
                resourceList.append(
                    addStudyResource(resource_tb.prop('id').substr(13),i)
                );
            }
        }
    });
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
   
    parentElement.find(".studyResources:nth(" + ind + ") input").each(function() {
        $(this).rules("remove");
        $(this).remove();
    });
}

function createConfirmationBox(messageText) {
    $("<div />").html(messageText).dialog({
        width: 450,
        buttons: [
            {
                text: "Yes",
                click: function() {
                    $( this ).dialog( "close" );
                    return true;
                }
            },
            {
                text: "No",
                click: function() {
                    $( this ).dialog( "close" );
                    return false;
                }
            }
        ],
        resizable: false,
        modal: true
    });
}

$(function(){
    $(".addControl[title='study']")
        .button({text: true, icons: {primary: "ui-icon-circle-plus"}})
        .on("click", function(e){
            e.preventDefault();

            var previousValid = false;
            $(pathForm).find(".studies input").each(function(i, el) {
                previousValid = $(el).validate().element("#" + el.id);
                return previousValid;
            });

            if(previousValid)
                addStudy();
        });
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
    $(document).on("click", ".termToDefine", termDisplay);
});

function checkedStateToValue(e) {
  return $(this).val(this.checked);
}

function resetForm() {
  $(pathForm).find(".studies").each(function(i, el) {
    if(i !== 0) {
      $(this).detach();
    } else {
      $(pathForm.lambda_1).val("1.0");
      $(pathForm.num_resource_1, pathForm.study_1).val("");
      $(pathForm.study_1).wrap("<form>").closest("form").get(0).reset();
      $(pathForm.study_1).unwrap();
      $(pathForm).find(".studyResources").detach();
    }
  });

  $(pathForm.database_pathway_option).attr("checked", "checked");
  $(pathForm.nperm).val((1e5).toExponential());
  $(pathForm.miss_rate).val(0.05);
  $(pathForm.maf).val(0.05);
  $(pathForm.hwep).val((1e-5).toExponential());
  $(pathForm.gene).val(0.95);
  $(pathForm.chr).val(0.95);
  $(pathForm.snp_n).val(5);
  $(pathForm.snp_percent).val(0);
  $(pathForm.gene_n).val(10);
  $(pathForm.gene_percent).val(0.05);
  $(pathForm.email).val("");
  $(".custom-combobox input").val("");
  $(pathForm.population).html("");
  $(pathForm.refinep)[0].checked = false;
  $(pathForm.gene_subset)[0].checked = false;
  $(pathForm.database_pathway_option)[0].checked = true;
  $(pathForm.database_pathway).find("option:first-child").attr("selected", "selected");
  $(pathForm.super_population).find("option:first-child").attr("selected", "selected");
  $(pathForm.file_pathway).wrap("<form>").closest("form").get(0).reset();
  $(pathForm.file_pathway).unwrap();

  $(pathForm).validate().resetForm();
  $(pathForm.population.parentElement).addClass('hide');
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
    $("#calculate").hide();
    $("progress").show();

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
    var groupCode = $(pathForm.population).find("option[value='" + item + "']")
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

  $(el).show();
  document.querySelector(el).scrollIntoView(true);
}

function apply_multiselect_options(element, group){
  element.html("");
  if(group.length > 0){
    $.each(population_labels[group].subPopulations, function (subCode, text) {
      element.append($("<option />", { value: group + "|" + subCode, text: '(' + subCode + ') ' + text }));
    });

   
    element.multipleSelect({
      name: pathForm.population.id,
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
  $("#errorDisplay, #successBox,progress").hide();
  $("#studyEntry").accordion({
    collapsible: true,
    heightStyle: "content",
    header: ".studyTitle"
  });

 

  $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);

  $("select[name='database_pathway'], input[name='file_pathway']").on("change", changeRadioSelection);

  $("select#super_population").on('change', function() {
    apply_multiselect_options($(pathForm.population), this.value);
  });

  $("#studyEntry").accordion("option", "active", 0);
  addStudy();// add first element by default, function declaration in template-manager
});
