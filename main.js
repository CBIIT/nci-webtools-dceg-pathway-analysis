$(document).ready(function() {
  setTimeout(function() {
    $('.termToDefine').webuiPopover();
  }, 0);

  $("#dialog").dialog({
    autoOpen: false,
    modal: true
  });
})

$(function () {
    var errors_div = $("#errorDisplay");
    $.validator.addMethod("boundedMax", function (value, element, params) {
        return value < params;
    });

    jQuery.validator.addMethod('scientific_notation_check', function (value, el) {
        return (typeof Number(value) === "number");
    });

    jQuery.validator.addMethod('doesStudyHaveResources', doesStudyHaveResources);

    var validationElements = {
        study: {
            required: true
        },
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
        },
        excluded_snp: {
          required: {
              depends: function (element) {
                  return $("#include_excluded_snp").is(":checked");
              }
          }
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
        },
        excluded_snp: {
            required: "When the Excluded SNP File button is checked an Exclued SNP File is required."
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

                errors_div.show();
            } else {
                $(pathForm).find('input,select').removeClass('error');
                errors_div.hide().empty();
            }
        }
    });


    $(pathForm).validate({
        ignore: ".custom-combobox *",
        rules: validationElements,
        messages: validationMessages,
        highlight: function (el, errorClass, validClass) {
            if (el.id != "population" && el.name != "selectItempopulation" &&
                el.name != "selectAllpopulation")
                $(el).addClass(errorClass);
            else {
                $("#population").next().find('.ms-choice').children()
                    .andSelf().addClass(errorClass);
            }

            var pattern = new RegExp("study_");
            if ( pattern.test(el.id)) {
              var highlightedElementName = createStudyProxy(retrieveUniqueId(el.id));
              $("#" + highlightedElementName).addClass(errorClass);
            }
        },
        unhighlight: function (el, errorClass, validClass) {
            if (el.id != "population" && el.name != "selectItempopulation" &&
                el.name != "selectAllpopulation"){
                $(el).removeClass(errorClass);
            }
            else {
                $("#population").next().find('.ms-choice').children().andSelf().removeClass(errorClass);
            }

            var pattern = new RegExp("study_");
            if ( pattern.test(el.id)) {
              var highlightedElementName = createStudyProxy(retrieveUniqueId(el.id));
              $("#" + highlightedElementName).removeClass(errorClass);
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

    // If the Family is Gaussian then the control sizes should not be sent to
    // the backend.
    if ( !isBinomialSelected() ) {
      $("input[name^='control_size_']").each(function(index,element) {
        formData.delete(element.id);
      });
    }

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
        $( "#successBox").show();
        document.querySelector("#successBox").scrollIntoView(true);

        setTimeout(function(){
            $( "#successBox" ).fadeOut().hide();
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

    $("#tabs").tabs({
      activate : function(event, ui) {

        var activeIndex = $("#studyEntry").accordion("option", "active");
        showTitle(undefined, undefined, activeIndex +1);
      }
    })
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

// function updateStudyTitles() {
//     var studyCount = $(pathForm).find(".studies").length;
//     var studies = $(pathForm).find(".studies");
//     studies.each(function(i, el) {
//       var titleElement = $(el).find('.studyTitle')
//       var titleHtml = titleElement.html();
//       titleElement.html(titleHtml.replace(/Study #\d/, "Study #" + (parseInt(i) + 1).toString()));
//     });
// }

function addStudy() {

    // var studyTemplate = $("#snippets").find(".studies").clone();

    var studyCount = $(pathForm).find(".studies").length;
    if ($(pathForm).find(".studies").last().attr("id") != undefined) {
      // console.log("TEST " + $(pathForm).find(".studies").last().attr("id").substring(11));
      studyCount = parseInt($(pathForm).find(".studies").last().attr("id").substring(11));
    }
    var studyIndex = studyCount + 1;
    // console.log("studyCount " + studyCount.toString());
    // console.log("studyIndex " + studyIndex.toString());

    var studyTemplate = $("#snippets").find(".studies").clone().prop('id', 'studyclass_'+studyIndex.toString() );;

    studyTemplate.find(".studyTitle").append(studyIndex);

    var studyLabel = studyTemplate.find('[for="study"]');
    // console.log(studyLabel);

    studyLabel.attr("for",studyLabel.attr("for")+"_"+studyIndex);
    // console.log(studyLabel);

    // $(".studies").attr('id',"study_"+studyIndex);

    var studyId = studyTemplate.find("#study");
    var attributeName = createStudyName(studyIndex);
    studyId.
      attr("name", createStudyName(studyIndex)).
      attr("id", createStudyName(studyIndex)).
      on("change", insertMessageWhenFileIsLoadedButNotValidated).
      on("change", ifFilenamePresentRemoveSizes).
      attr( createDataSizeStudyAttributeName(studyIndex), 0);

    // console.log(studyId);

    // The Study Button will be made invisible so that we can display the file
    // name as we want to.  By making this visible the selected filename will
    // not be displayed by the input type=file.  However, it can be be displayed
    // using another HTML Object.
    var studyLabelVisibleButtonLabel = studyTemplate.find("#studyProxy");
    var studyLabelVisibleId = createStudyProxy(studyIndex);
    studyLabelVisibleButtonLabel.
      attr("name", studyLabelVisibleId).
      attr("id", studyLabelVisibleId).
      on("click", proxyClickForHtmlInputFileType);

    var loadAndStudyButton = studyTemplate.find("#loadAndCheckButton");
    var button1Name = createLoadAndStudyButtonName(studyIndex);
    loadAndStudyButton.
      attr("id", button1Name).
      attr("name", button1Name).
      on("click", loadAndValidate);
    insertMessageWhenFileIsNotLoaded(studyIndex);

    // Add the Id, name to the new load and study label.  This will be place
    // where all message about validation of the study files will be placed.
    var loadAndStudyLabel = studyTemplate.find('#loadAndCheckLabel');
    var idButtonLabel1 = loadAndStudyLabel.attr("id") + "_" + studyIndex;
    loadAndStudyLabel.
      attr("id", idButtonLabel1).
      attr("name", idButtonLabel1);

    var lambdaLabel = studyTemplate.find('[for="lambda"]');
    lambdaLabel.attr("for",lambdaLabel.attr("for")+"_"+studyIndex);
    var lambdaId = studyTemplate.find("#lambda");
    lambdaId.
      attr("name",lambdaId.attr("id")+"_"+studyIndex).
      attr("id",lambdaId.attr("id")+"_"+studyIndex);

    var sizeTitlesId = createSizeTitleName(studyIndex);
    var sizeTitles = studyTemplate.find("#size_titles");
    sizeTitles.
      attr("name", sizeTitlesId).
      attr("id", sizeTitlesId);

    var placeHolderForStudyResources = studyTemplate.find("#place_holder_for_study_resources");
    var placeHolderId = placeHolderForStudyResources.attr('id') + "_" + studyIndex;
    placeHolderForStudyResources.
      attr("name", placeHolderId).
      attr("id", placeHolderId);

    var resetButton = studyTemplate.find("#resetStudy");
    var idButton2 = resetButton.attr("id") + "_" + studyIndex;
    resetButton.
      attr("id", idButton2).
      attr("name", idButton2).
      on("click", resetStudy);

    var deleteButton = studyTemplate.find("#deleteStudy");
    var idButton3 = deleteButton.attr("id") + "_" + studyIndex;
    deleteButton.
      attr("id", idButton3).
      attr("name", idButton3);
      // on("click", deleteStudy);

    // $(document).ready(function() {
    //   $("#dialog").dialog({
    //     autoOpen: false,
    //     modal: true
    //   });
    // });

    deleteButton.click(function(e) {
      var numStudies = $("#studyEntry").children().length;
      // console.log(numStudies);
      e.preventDefault();
      // var targetUrl = $(this).attr("href");
      if (numStudies > 1) {
        $("#dialog").dialog({
          position: {
              my: 'center',
              at: 'center',
              of: $('#studyEntry')
            },
            buttons : {
              "Confirm" : function() {
                deleteStudy(e);
                // updateStudyTitles();
                $(this).dialog("close");
              },
              "Cancel" : function() {
                $(this).dialog("close");
              }
            }
        });
        $("#dialog").dialog("open");
      } else {
        $("#dialog-except").dialog({
          position: {
              my: 'center',
              at: 'center',
              of: $('#studyEntry')
            },
            buttons : {
              "Close" : function() {
                $(this).dialog("close");
              }
            }
        });
        $("#dialog-except").dialog("open");
      }
    });

    $("#studyEntry").append(studyTemplate);

    studyId.rules("add", {
        required: true,
        messages: {
          required: "Study #" + studyIndex + " must have a file that been checked."
        }
    });

    lambdaId.rules("add", {
      required: true,
      number: true,
      min: 1,
      messages: {
        required: "The " + lambdaId.attr('id') + " field is required",
        number: "The " + lambdaId.attr('id') + " value must be a number",
        min: "The " + lambdaId.attr('id') + " value must be greater than or equal to 1"
      }
    });

    loadAndStudyButton.rules("add", {
        doesStudyHaveResources: true,
        messages: {
          doesStudyHaveResources: "The " + loadAndStudyButton.attr('id') + " has not been pressed.            "
          // doesStudyHaveResources: "A 'Load & Check' button has not been pressed. Make sure all resources are filled."
        }
    });

    var activeIndex = $("#studyEntry").accordion("refresh").accordion({
        active: studyCount
    }).accordion("option", "active");

    showTitle(undefined, 0, studyIndex);


/*    studyTemplate.find("input[id*='num_resource']").on("change", function (e) {
        var id = $(this).prop('id');
        var valid = false;
        valid = $(this).validate().element('#' + id);
        if (valid) {
            var choice;
            if (this.value > 20)
                choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
            else:
                choice = true;

            if (choice) {
                var resourceList = studyTemplate.find('ul.resource-list');
                resourceList.children('.studyResources:nth('+(this.value-1)+') ~ .studyResources').remove();
                resourceList.find('input').each(function(i,el) {
                  el.value = '';
                });
                for (var i = resourceList.children().l    var loadAndStudyButton = studyTemplate.find('#loadAndCheckButton');
ength+1; i <= this.value; i++) {


                    var studyResource = addStudyResource(id.substr(13), i);
                    resourceList.append(studyResource);

                    studyResource.find('input').rules("add", {
                        required: true,
                        digits: true,
                        messages: {
                            required: "The sample size value is required",
                            digits: "The sample size value must be an integer"
                        }
                    });
                }
            }
        }
    }); */
}

/*
 * Creates a row where the user can enter the size of the sample or the size
 * of the sample and the control
 */
function addStudyResource(study, ind) {


    var resource_element = $("#snippets").children(".studyResources").clone();
    var elementLabel = resource_element.find("label");
    var elementInputSampleSize = resource_element.find("#sample_size");
    var elementInputControlSize = resource_element.find("#control_size");

    var LabelFor = elementLabel.attr("for") + "_" + study + "_" + ind;
    var labelText = elementLabel[0].innerHTML + " #" + ind + ":";

    var commonPart = "_" + study + "_" + ind;
    var inputSampleSizeId  = elementInputSampleSize.attr("id") + commonPart;
    var inputControlSizeId = elementInputControlSize.attr("id") + commonPart;

    elementLabel.attr("for", LabelFor);
    elementLabel.text(labelText);
    elementInputSampleSize.attr("id", inputSampleSizeId).attr("name", inputSampleSizeId);
    elementInputControlSize.attr("id", inputControlSizeId).attr("name", inputControlSizeId);

    return resource_element;
}

/*
 * Updates a Specific Study.  The Function will either set up the study for an
 * an error ( set the error color and message ) or produce the sample sizes for
 * each resoruce.
 */
function updateSpecificStudy(data, filename, event)
{
    var uniquePartOfVariable = retrieveUniqueId(event.target.id);
    var loadAndCheckLabelElement = $("#" + "loadAndCheckLabel_" + uniquePartOfVariable);
    var placeHolderElement = $("#" + "place_holder_for_study_resources_" + uniquePartOfVariable);

    removeClassAboutColor(loadAndCheckLabelElement);
    clearAllSampleSizeResources(event);

    if ( data.errorMessage.length > 0 ) {
      loadAndCheckLabelElement.addClass("errorColor");
      loadAndCheckLabelElement.text(data.errorMessage);
    var uniquePartOfVariable = retrieveUniqueId(event.target.id);
      $("#" + createStudyName(uniquePartOfVariable)).attr(createDataSizeStudyAttributeName(index), 0);
    }
    else {
      loadAndCheckLabelElement.addClass("successColor");
      loadAndCheckLabelElement.text(filename);
      var numberOfRecords = parseInt(data.numberOfRecords);

      $("#" + createStudyName(uniquePartOfVariable)).attr(createDataSizeStudyAttributeName(uniquePartOfVariable), numberOfRecords);

      // The validations need to be set after begin appended to the form.  If
      // html element is not attached to a form then an error message such as
      // cannot read property nodeType will be issued.
      var studyResource;
      for ( var index = 0; index < numberOfRecords; index++)
      {
        studyResource = addStudyResource(uniquePartOfVariable, index+1)
        placeHolderElement.append(studyResource)
      }
      var elements = [];
      // console.log("Is Binomial selected? " + isBinomialSelected().toString());
      if ( isBinomialSelected() )
        elements = [ "[id^='sample_size_']", "[id^='control_size_']" ];
      else {
        elements = [ "[id^='sample_size_']" ];
      }
      // console.log(elements);
      elements.forEach(function(element) {
             placeHolderElement.find(element).each( function(i, element) {
               $("#" + element.id).rules("add", {
                   required: true,
                   number: true,
                   min: 1,
                   messages: {
                       required: "The " + element.id + " field is required",
                       number: "The " + element.id + " value must be a number",
                       min: "The " + element.id + " value must be greater than or equal to 1"
                     }
                   });
             });
      });

    showTitle(data, undefined, uniquePartOfVariable);
    disableCalculateButton(data);
  }
}

/* A function that creates the name of the object that contains the attribute */
/* for how many sizes rows have been recorded                                 */
function createDataSizeStudyAttributeName(index) {
  return "data-study-size-count" + "_" + index;
}


function createStudyName(index)
{
  var studyId = $(document).find("#study");
  return studyId.attr("id") + "_" + index;
}

/*
 * Removes all Resource Set Size Input Rows from the GUI
 */
function clearAllSampleSizeResources(event) {

  var uniquePartOfVariable = retrieveUniqueId(event.target.id);
  var placeHolder = "place_holder_for_study_resources_" + uniquePartOfVariable;

  $("#"+placeHolder).empty();
}

function createConfirmationBox(messageText) {
    $("<div />").html(messageText).dialog({
        width: 450,
        buttons: [
            {
                text: "Yes",
                click: function () {
                    $(this).dialog("close");
                    return true;
                }
            },
            {
                text: "No",
                click: function () {
                    $(this).dialog("close");
                    return false;
                }
            }
        ],
        resizable: false,
        modal: true
    });
}

$(function () {
    $(".addControl[title='study']")
        .button({
            text: true,
            icons: {
                primary: "ui-icon-circle-plus"
            }
        })
        .on("click", function (e) {
            e.preventDefault();
            var validator = $(pathForm).validate();


            var previousValid = false;
            $(pathForm).find(".studies input").each(function (i, el) {
                previousValid = validator.element("#" + el.id);
                return previousValid;
            });

            // console.log("The number of invalid fields are " + validator.numberOfInvalids());
            //s
            if (parseInt(validator.numberOfInvalids()) == 0 )
                addStudy();
                // updateStudyTitles();
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
        definition:"Any SNP with missing rate greater than snp.miss.rate will be removed from the analysis. The default is 0.05."
    },
    "maf": {
        fullName:"maf",
        definition:"Any SNP with minor allele frequency less than maf will be removed from the analysis. The default is 0.05."
    },
    "hwep": {
        fullName:"HWE.p",
        definition:"Any SNP with HWE exact p-value less than HWE.p will be removed from the analysis. The test is applied to the reference data. The default is 1E-5."
    },
    "gene": {
        fullName:"Gene.R2",
        definition:"A number between 0 and 1 to filter out SNPs that are highly correlated within each gene. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than gene.R2. The default is 0.95."
    },
    "chr": {
        fullName:"Chr.R2",
        definition:"A number between 0 and 1 to filter out SNPs that are highly correlated within each chromosome. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than chr.R2. The default is 0.95."
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
        definition: "A value x between 0 and 1 such that a truncation point will be defined at every x percent of the top genes. If 0 then the truncation points will be 1:inspect.gene.n. The default is 0.05."
    },
    "Excluded SNPs File": {
        fullName: "Excluded SNP File",
        definition: "Upload one a file containing the excluded SNPs."
    }
};

$(function() {
  for (key in terms) {
    var value = terms[key];
    var element = $('[data-term="' + key + '"][class="termToDefine"]')
    // console.log(key, value, element)
    element.attr("data-title", value.fullName)
    element.attr("data-content", value.definition)
  }
});

function checkedStateToValue(e) {
  return $(this).val(this.checked);
}

function resetForm() {
  $(pathForm).find(".studies").each(function(i, el) {
    // console.log($(this));
    $(this).remove();
    // if(i !== 0) {
    //   $(this).remove();
    // } else {
    //   $('#lambda_1').val("1.0");
    //   $('#study_1').val("");
    //   $('#place_holder_for_study_resources_1').empty()
    //   $('#size_titles_1').hide();
    //   $('#loadAndCheckLabel_1').text(messageNoFileLoaded());
    //   $("#study_1").attr(createDataSizeStudyAttributeName(1), "0");
    //   $('#study_1').wrap("<form>").closest("form").get(0).reset();
    //   $('#study_1').unwrap();
    //   $('#num_resource_1').val("1");
    //   $(pathForm).find(".studyResources:not(:first)").remove();
    //   $(pathForm).find(".studyResources input").val("");
    // }
  });
  addStudy();
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
  $('#population').parent().addClass('hide');
  $(pathForm).find("button,input,select,div,span").removeClass("error");
  // must reset # of invalids
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

      //alert(el.id);
      //if(el.id.indexOf("study") > -1) numStudies++;


      if(el.type == "checkbox") {
        if(el.checked && el.id)
        formData.append(el.id, el.checked);
        // console.log(el.id, el.checked);
      }
    });

    var study_ids = [];
    $(pathForm).find(".studies").each(function(i, el) {
      study_ids.push(parseInt(el.id.toString().substring(11)));
    });
    // console.log(study_ids);
    formData.append('study_ids', study_ids.join(" "));
    // console.log(study_ids.join(" "));

    formData.append('populations', $('#population').val());
    formData.append('num_studies', $("#studyEntry").children().length);
    insertNumberOfResourcePerStudy(formData, study_ids);




    // Business Rule: If the include_excluded_snp is not chekced then
    // the execluded_snp filename should not be include in the form data
    var includeExcludedSnp = $('#include_excluded_snp');
    if ( ! includeExcludedSnp.is(':checked')) {
      formData.delete("excluded_snp");
    }

    sendForm(formData).then(submission_result, submission_error).always(post_request);
  }
  else {
    document.querySelector("#errorDisplay").scrollIntoView(true);
  }
}

/**
 * For each study insert the number of resources
 */
function insertNumberOfResourcePerStudy(formData, study_ids) {
  for ( var index = 0;  index < study_ids.length; index++ ) {
    var value = study_ids[index];
    // var numStudiesStr = (index + 1).toString();
    var idStr = value.toString();
    var resourceDivChildren = $('#place_holder_for_study_resources_' + idStr).children().length;
    formData.append("num_resource_" + idStr, resourceDivChildren);
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
    header: ".studyTitle",
    activate: setupTab
  });

  $("select[name='database_pathway'], input[name='file_pathway']").on("change", changeRadioSelection);

  $("select#super_population").
    on('change', function() {
      apply_multiselect_options($('#population'), this.value);
    }).
    on('change', enableSubpopulationComboBox);

  $("#studyEntry").accordion("option", "active", 0);
  addStudy();// add first element by default, function declaration in template-manager

});

/*
 * If the radio button to include the excluded snp file is selected then
 * make the file input button appear
 */
function clickCheckBox() {
  var selectedCheckBox = document.getElementById('include_excluded_snp');
  var guiElement = document.getElementById('excluded_snp');

  if ( selectedCheckBox.checked )
  {
    guiElement.style.visibility = 'visible';
  } else {
    guiElement.style.visibility = 'hidden';
    guiElement.value = "";
  }
}

/*
 * Code that will reset a study
 */
 function resetStudy(event) {
   var uniquePartOfVariable = retrieveUniqueId(event.target.id);

   var studyFilenameInput = "study_" + uniquePartOfVariable;
   var lamdaNameInput = "lambda_" + uniquePartOfVariable;
   var loadAndCheckButton = "loadAndCheckButton_" + uniquePartOfVariable;
   var placeHolder = "place_holder_for_study_resources_" + uniquePartOfVariable;


   $("#" + studyFilenameInput).val("");
   $("#" + studyFilenameInput).attr(createDataSizeStudyAttributeName(uniquePartOfVariable), "0");
   $("#" + lamdaNameInput).val("1.0");
   insertMessageWhenFileIsNotLoaded(uniquePartOfVariable);
   clearAllSampleSizeResources(event)
   showTitle(undefined, 0, uniquePartOfVariable);
 }

/*
* Code that will delete a study
*/
function deleteStudy(event) {
  var uniquePartOfVariable = retrieveUniqueId(event.target.id);
  $("#studyclass_" + uniquePartOfVariable).remove();
  // var studyFilenameInput = "study_" + uniquePartOfVariable;
  // var lamdaNameInput = "lambda_" + uniquePartOfVariable;
  // // var loadAndCheckButton = "loadAndCheckButton_" + uniquePartOfVariable;
  // // var placeHolder = "place_holder_for_study_resources_" + uniquePartOfVariable;
  // // $("#" + lamdaNameInput).rules( "remove" );
  //
  // clearAllSampleSizeResources(event)
  // // $("#" + lamdaNameInput).val("1.0"); //.remove()?
  // // $("#" + lamdaNameInput).remove();
  // $("#" + studyFilenameInput).attr(createDataSizeStudyAttributeName(1), "0");
  // $("#" + studyFilenameInput).wrap("<form>").closest("form").get(0).reset();
  //
  // $("#" + studyFilenameInput).unwrap();
  // $("#studyclass_" + uniquePartOfVariable).remove();
  // $("#" + studyFilenameInput).attr(createDataSizeStudyAttributeName(uniquePartOfVariable), "0");
  // $("#" + lamdaNameInput).val("1.0");
  // insertMessageWhenFileIsNotLoaded(uniquePartOfVariable);
  // showTitle(undefined, 0, uniquePartOfVariable);
}

 /*
  * Code that will load and validate
  */
function loadAndValidate(event) {
      // Create the unique id that will retrieve the data from the form.
      var uniquePartOfVariable = retrieveUniqueId(event.target.id);
      var studyFilenameInput = createStudyName(uniquePartOfVariable);

      clearButtonsOfErrors(uniquePartOfVariable);

      // Retreive the data from the form and add the variable containing the
      // filename of the study.  We may not need the stuydFileNameInput
      var formData = new FormData(pathForm);
      formData.append('currentStudy', studyFilenameInput);

      var result = $.ajax({
           //beforeSend: pre_request,
           type: "POST",
           url: "loadAndCheck_summaryData/",
           data: formData,
           cache: false,
           processData: false,
           contentType: false,
           dataType: "json",
           success: function(data) {
             updateSpecificStudy(data, formData.get(studyFilenameInput).name, event);
             if ( data.numberOfRecords == 0 ) {
               handleNoTitles(uniquePartOfVariable);
             } else {
               if ( isBinomialSelected() ) {
                 handleBinomial();
               } else
                handleGaussian();
               }
           }
        });
}

/*
 * Determines if the title for the sample size and control size should be shown
 * or just the sample size or none if no record has been selected yet.
 *
 * parameters
 *  data :            The number of records that were loaded
 *  currentSizeCount: The number of records loaded into the study
 *  index:            The index of the active study.
 */
function showTitle(data, currentSizeCount, index) {

  // Default Case is to show no title if data is undefined or 0 and
  // the currentSizeCount is undefined or 0.  Note due to my inexperience
  // with front end programming, I made sure to hide everything
  var dataNotPresent =
    data === undefined || ( data !== undefined && parseInt(data.numberOfRecords) == 0 );
  var currentSizeCountNotPresent =
    currentSizeCount === undefined || ( currentSizeCount !== undefined && parseInt(currentSizeCount) == 0);
  if ( dataNotPresent && currentSizeCountNotPresent) {
    $("#" + createSizeTitleName(index) ).hide();
    $("#" + createSizeTitleName(index) + "> #caseTitleSize").hide();
    $("#" + createSizeTitleName(index) + "> #caseTitleControl").hide();
    return;
  }


  // Rule: Show both titles if binomial is selected
  var isBinomial = $("#binomial").is(':checked');
  var showBoth = ( isBinomial ) ? true : false;

  // From this point on the rules will only concern binomial
  if ( isBinomial )
  {
    if ( data !== undefined && parseInt(data.numberOfRecords) > 0) {
      // Rule: Show both titles if the number of rows for the size is greater than 0
      showBoth = true;
    } else if ( currentSizeCount !== undefined && parseInt(currentSizeCount) > 0 ) {
      // Rule: If the data-study-size-count > 0 then the study already had data
      // entered into the study.
      showBoth = true;
    } else {
      showBoth = false
    }
  }

  // Show both or hide the control size
  if ( showBoth ) {
    $("#" + createSizeTitleName(index) ).show();
    $("#" + createSizeTitleName(index) + "> #caseTitleSize").show();
    $("#" + createSizeTitleName(index) + "> #caseTitleControl").show();
  }
  else {
    $("#" + createSizeTitleName(index) ).show();
    $("#" + createSizeTitleName(index) + "> #caseTitleSize").show();
    $("#" + createSizeTitleName(index) + "> #caseTitleControl").hide();
  }
}


/**
 * This routine will execute a click that will execute the onClick() of another
 * button
 */
function proxyClickForHtmlInputFileType() {
  var uniqueId = retrieveUniqueId(event.target.name);

  clearButtonsOfErrors(uniqueId);

  var name = createStudyName(uniqueId);
  $("#" + name).click();
}

/**
 * Inserts message when no file is load
 */
function insertMessageWhenFileIsNotLoaded(id) {
  $("#" + "loadAndCheckLabel_" + id).text(messageNoFileLoaded());
}

/**
 * Message when no file is Loaded
 */
function messageNoFileLoaded() {
  return "No File Loaded";
}


/**
 * Inserts a message when the file has been successfully Loaded.
 *
 * If length of the files list is 0 we can assume that no files were selected.
 * then the previous state will remain the same.
 *
 */
function insertMessageWhenFileIsLoadedButNotValidated(event) {
  var uniquePartOfVariable = retrieveUniqueId(event.target.id);

  if ( event.target.files.length != 0 ) {
    var filename = event.target.files[0].name;
    var domObject =   $("#" + "loadAndCheckLabel_" + uniquePartOfVariable);

    removeClassAboutColor(domObject);
    domObject.addClass("normalColor");
    domObject.text(filename + messageLoadedNotChecked());
  }
}

/**
 * Message when the file is loaded, but not checked
 */
function messageLoadedNotChecked() {
  return " loaded, but not validated";
}
/**
 * Remove all Message classes from an DOM Object
 */
function removeClassAboutColor(htmlObject) {
  htmlObject.removeClass("errorColor");
  htmlObject.removeClass("successColor");
  htmlObject.removeClass("normalColor");
}

/*
 * if there was an error in validating the form and then the calculate button
 * should be disabled
 */
function disableCalculateButton(data)
{
  // Start with the assumption that the button is not disabled
  $("#calculate").removeClass("errorColor");
  $("#calculate").attr("disabled", false);

  // Determine if the button is disabled and modify accordingly
  if ( data.errorMessage.length != 0 ) {
    $("#calculate").attr("disabled", true);
    $("#calculate").addClass("errorColor");
  }

}

/**
 * Purpose : To setup the tab after the user cliked the tab to be activated
 */
function setupTab(event, ui) {

  var specificStudyIndex = $("#studyEntry").accordion("option", "active"); + 1;
  var objectName = createStudyName(specificStudyIndex);
  var name = createDataSizeStudyAttributeName(specificStudyIndex);
  var numberOfSizes = $("#" + objectName).attr(name);

  showTitle(undefined, numberOfSizes, specificStudyIndex);
}$("#studyEntry").accordion("option", "active")

/* A function that retrieves the name containing the number of sizes stored in the study */
/* since it will be used in multiple places                                              */
function createDataSizeStudyAttributeName(index) {
  return "data-study-size-count" + "_" + index;
}

/* A function that creates the name of the object that contains the attribute */
/* for how many sizes rows have been recorded                                 */
function createStudyName(index)
{
  var studyId = $(document).find("#study");
  return studyId.attr("id") + "_" + index;
}

/* A function that creates the name of object that is button cliked the       */
/* invisible htmlIpnput type file will be clicik by the current button so     */
/* so the file dialog can appear and the name file can be display somewhere   */
/* else in the form                                                           */
function createStudyProxy(index) {
  var studyProxyId = $(document).find("#studyProxy");
  return studyProxyId.attr("id") + "_" + index;
}

/* A function to crate the name for the object that contains the title for the */
/* size columns.                                                               */
function createSizeTitleName(index) {
  return $(document).find("#size_titles").attr("id") + "_" + index;
}

/* Handles selction of a binomial                                             */
function handleBinomial() {
  $("[id^='sample_size_']").removeClass("single");
  $("[id^='control_size_']").removeClass("single");

  $("[id^='size_titles_']").each(function(index, value) {
    var numberOfCurrentEntries = $("#" + createStudyName(index+1)).attr(createDataSizeStudyAttributeName(index+1));
    showTitle(undefined, numberOfCurrentEntries, index + 1);
  });

}

/* Handles selection of a Gaussian                                            */
function handleGaussian() {
  $("[id^='sample_size_']").addClass("single");
  $("[id^='control_size_']").addClass("single");

  $("[id^='size_titles_']").each(function(index, value) {
    var numberOfCurrentEntries = $("#" + createStudyName(index+1)).attr(createDataSizeStudyAttributeName(index+1));
    showTitle(undefined, numberOfCurrentEntries, index + 1);
  });

}

/* Handles the case where you do not want any titles.  I add this routine for */
/* handling error condtions                                                   */
function handleNoTitles(index) {
  showTitle(undefined, undefined, index+1);
}



/**
 * Enameble the sub population drop down combo box
 */
function enableSubpopulationComboBox() {
  $('#population').removeAttr('disabled');
}

/**
 * Retrieves the value that make an Id unique.
 */
function retrieveUniqueId(name) {
  return name.split("_")[1];
}

/**
 * creates the name for sample size text field
 */
function createSampleSizeTextFieldName(study_id, index) {
  return "sample_size" + "_" + study_id.toString() + "_" + index.toString();
}

/**
 * creates the name for the control size text field
 */
function createControlSizeTextFieldName(study_id, index) {
  return "control_size" + "_" + study_id.toString() + "_" + index.toString();
}

/**
 * Returns true if the binomial radio button is checked.
 */
function isBinomialSelected() {
  return $("#binomial").is(':checked');
}

/**
 * Validaes that the study has Size fields.  If the Study has size fields then
 * the file has been checked and loaded.
 */
 function doesStudyHaveResources( value, element ) {
   var studyNum = element.name.substring(19);
  //  console.log("study number: " + studyNum);
   var resourceCount = 0;
   resourceCount = $('#place_holder_for_study_resources_' + studyNum).children().length
  //  console.log("resourceCount: " + resourceCount.toString() + " in study " + studyNum);
   return (resourceCount > 0) ? true : false;
 }

/**
 * Create the unique name for a button that validates the file
 */
 function createLoadAndStudyButtonName(index) {
   return $(document).find("#loadAndCheckButton").attr("id") + "_" + index;
 }

/**
 * Clears the Choose File and Load & Check Button at the same time.  Jquery
 * validationElements did not00 clear the checkbox when they were checked, so I
 * did it automatically.
 *
 * look at the behavior of the text entry field.  Once a text entry field was
 * changed the error messages disappeared.
 */
function clearButtonsOfErrors(uniquePartOfVariable) {
  var loadAndCheckButtonName = createLoadAndStudyButtonName(uniquePartOfVariable);
  var chooseFileNameButtonName = createStudyProxy(uniquePartOfVariable)

  $("#" + loadAndCheckButtonName).removeClass('error');
  $("#" + chooseFileNameButtonName).removeClass('error');

  //$("#pathForm").resetForm();
}

/*
 * Removes all sizes from form
 */
function ifFilenamePresentRemoveSizes(event) {
  var uniquePartOfVariable = retrieveUniqueId(event.target.id);
  clearAllSampleSizeResources(event)
  showTitle(undefined, 0, uniquePartOfVariable);
}
