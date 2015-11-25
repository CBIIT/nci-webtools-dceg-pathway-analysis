$.widget( "custom.combobox", {
    _create: function() {
        this.wrapper = $( "<span>" )
            .addClass( "custom-combobox" )
            .insertAfter( this.element );

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
    },

    _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
            value = selected.val() ? selected.text() : "";

        this.input = $( "<input>" )
            .appendTo( this.wrapper )
            .val( value )
            .attr( "title", "" )
            .attr("placeholder", "Begin typing or select from list:")
            .addClass( "custom-combobox-input ui-widget ui-widget-content" )
            .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
        })
            .tooltip({
            classes: {
                "ui-tooltip": "ui-state-highlight"
            }
        });

        this._on( this.input, {
            autocompleteselect: function( event, ui ) {
                ui.item.option.selected = true;
                this._trigger( "select", event, {
                    item: ui.item.option
                });
            },

            autocompletechange: "_removeIfInvalid"
        });
    },

    _createShowAllButton: function() {
        var input = this.input,
            wasOpen = false;

        $( "<a>" )
            .attr( "tabIndex", -1 )
            .attr( "title", "Show All Items" )
            .tooltip()
            .appendTo( this.wrapper )
            .button({
            icons: {
                primary: "ui-icon-circle-triangle-s"
            },
            text: false
        })
            .removeClass( "ui-corner-all" )
            .addClass( "custom-combobox-toggle ui-corner-right" )
            .on( "mousedown", function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
        })
            .on( "click", function() {
            input.trigger( "focus" );

           
            if ( wasOpen ) {
                return;
            }

           
            input.autocomplete( "search", "" );
        });
    },

    _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
            var text = $( this ).text();
            if ( this.value && ( !request.term || matcher.test(text) ) )
                return {
                    label: text,
                    value: text,
                    option: this
                };
        }) );
    },

    _removeIfInvalid: function( event, ui ) {

       
        if ( ui.item ) {
            return;
        }

       
        var value = this.input.val(),
            valueLowerCase = value.toLowerCase(),
            valid = false;
        this.element.children( "option" ).each(function() {
            if ( $( this ).text().toLowerCase() === valueLowerCase ) {
                this.selected = valid = true;
                return false;
            }
        });

       
        if ( valid ) {
            return;
        }

       
        this.input
            .val( "" )
            .attr( "title", value + " didn't match any item" )
            .tooltip( "open" );
        this.element.val( "" );
        this._delay(function() {
            this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
    },

    _destroy: function() {
        this.wrapper.remove();
        this.element.show();
    }
});

$(function() {
    $("#calculate").on("click", clickCalculate);
    $("#reset").on("click", resetForm);
    $("#errorDisplay, #successBox,progress").hide();
    $("#studyEntry").accordion({
        collapsible: true,
        heightStyle: "content",
        header: ".studyTitle"
    });

   
    $(pathForm.population).multipleSelect(
        {
            name: pathForm.population.id,
            width: "100%",
            placeholder:"Select Population(s)",
            selectAll: false,
            multiple: true,
            multipleWidth: 300,
            minimumCountSelected: 2,
            countSelected: false,
            onClick:function(view) {
                $(pathForm.population).validate();
            },
            onOptgroupClick:function(view) {
                $(pathForm.population).validate();
            }
        });

   
    $("button").button();
    $(pathForm).find("[type='checkbox']").on("change", checkedStateToValue);
});

$(window).load(function() {
    $("select[name='database_pathway'], input[name='file_pathway']")
        .on("change", changeRadioSelection);
});

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
    $(".custom-combobox input").val("");
    $(refinep)[0].checked = false;
    $(gene_subset)[0].checked = false;
    $(database_pathway_option)[0].checked = true;
    $(database_pathway).find("option:first-child").attr("selected", "selected");
    $(file_pathway).wrap("<form>").closest("form").get(0).reset();
    $(file_pathway).unwrap();

    $(pathForm).validate().resetForm();
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


var serviceBase = "/pathwayRest/";
var buttons = $("button").button();

$(function(){
    var count = 2;
    var hold = function() {
        count--;
        if (count <= 0)
            post_request();
    };
   
    retrieve_pathways().then(apply_options_combobox($(pathForm.database_pathway)), get_options_error("pathway")).always(hold);
    retrieve_populations().then(apply_multiselect_options($(pathForm.population)), get_options_error("population")).always(hold);
});

function pre_request() {
   
    $("#spinner").show();

   
    $(pathForm).find(":input").prop("disabled",true);
    buttons.button("disable");
}

function post_request() {
   
    $("button#calculate").show();
    $("progress, #spinner").hide();

   
    buttons.button("enable");
    $(pathForm).find(":input").removeAttr("disabled");
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

function apply_multiselect_options(element){
    population_labels ={'AFR':{'fullName':'African','subPopulations':{'YRI':'Yoruba in Ibadan, Nigera','LWK':'Luhya in Webuye, Kenya','GWD':'Gambian in Western Gambia','MSL':'Mende in Sierra Leone','ESN':'Esan in Nigera','ASW':'Americans of African Ancestry in SW USA','ACB':'African Carribbeans in Barbados'}},'AMR':{'fullName':'Ad Mixed American','subPopulations':{'MXL':'Mexican Ancestry from Los Angeles, USA','PUR':'Puerto Ricans from Puerto Rico','CLM':'Colombians from Medellin, Colombia','PEL':'Peruvians from Lima, Peru'}},'EAS':{'fullName':'East Asian','subPopulations':{'CHB':'Han Chinese in Bejing, China','JPT':'Japanese in Tokyo, Japan','CHS':'Southern Han Chinese','CDX':'Chinese Dai in Xishuangbanna, China','KHV':'Kinh in Ho Chi Minh City, Vietnam'}},'EUR':{'fullName':'European','subPopulations':{'CEU':'Utah Residents from North and West Europe','TSI':'Toscani in Italia','FIN':'Finnish in Finland','GBR':'British in England and Scotland','IBS':'Iberian population in Spain'}},'SAS':{'fullName':'South Asian','subPopulations':{'GIH':'Gujarati Indian from Houston, Texas','PJL':'Punjabi from Lahore, Pakistan','BEB':'Bengali from Bangladesh','STU':'Sri Lankan Tamil from the UK','ITU':'Indian Telugu from the UK'}}};

    return function(data) {
        $.each(data, function (key, population) {
            var optGroup = $(element).has("optgroup[label='" + population.group + "']").length > 0 ? $(element).find("optgroup[label='" + population.group + "']") : $("<optgroup label='" + population.group + "'/>");

            var superLabel = population_labels[population.group].fullName;
            var subLabel = population_labels[population.group].subPopulations[population.subPopulation];
            var option = $("<option />", { value: population.group+"|"+population.subPopulation, text: subLabel });

            optGroup.append(option);

            $(element).append(optGroup).multipleSelect('refresh');
        });

        $(element).multipleSelect("uncheckAll");

        $(".group input[type='checkbox']").on("click", function(e) {
            var targetedElement = e.target;
           
            var otherGroups = $("label.optgroup").not(this.parentElement);

            otherGroups.find("input[type='checkbox']").not(targetedElement).each(function(i, el){
                if(el != targetedElement && el.checked) {
                    $(el).trigger("click");
                }
            });

            if(!targetedElement.checked){
                $(targetedElement).trigger("click");
            }
           
        });
    };
}

function apply_options_combobox(element){
    return function(data) {
        data.forEach(function(item, i) {
            var option = $("<option></option>");
            $(option).val(item.code);
            $(option).text(item.text);
            element.append(option);
        });

        element.combobox();
    };
}

function submission_error(request, statusText, error) {
    var errorObj = JSON.parse(request.responseText);

    displayErrors("#errorDisplay",
                  ["The request failed with the following message: <br/> "+ errorObj.message]);
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
        url: serviceBase + "options/pathway_options/",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}

function retrieve_populations(){
    return $.ajax({
        url: serviceBase + "options/population_options/",
        type: "GET",
        beforeSend: pre_request,
        contentType: "application/json",
        dataType: "json",
        cache: false
    });
}




$(window).on('load', function(){
    $(".addControl[title='study']")
        .button({text: true, icons: {primary: "ui-icon-circle-plus"}})
        .on("click", function(e){
        e.preventDefault();

        var previousValid = false;
        $(pathForm).find(".studies input").each(function(i, el) {
            var validator = $(this).validate();
            previousValid = validator.element("#" + el.id);
            return previousValid;
        });

        if(previousValid)
            addStudy();
    });

    $(".addControl[title='resource']")
        .button({ text: false, icons: {primary: "ui-icon-circle-plus" }})
        .on("click", function(e) {
            e.preventDefault();

            var el = $(this);
            var previousValid = false;
            var validator = $(pathForm).validate();

            var resource_tb = $(this).prev();
            var resourceValue = resource_tb.val();

            previousValid = resource_tb.validator.element("#" + resource_tb.id);

            if(previousValid){
                for(var i = 0; i != resourceValue; i++) {
                   
                   
                    $(el.parent().parent()[0]).append(
                        addStudyResource(el.prop('id').substr(13),(i+1))
                    );
                }
            }
    });

    addStudy();// add first element by default

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

        var activeIndex = $("#studyEntry").accordion("option", "active");

        $(pathForm)
            .find(".studies:nth("+ activeIndex+ ") input[id*='num_resource']")
            .on("change", function(e) {
            if(Number(this.value)) {
                var choice;
                if(this.value > 20)
                    choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
                else
                    choice = true;

                if(choice) {
                    if($(pathForm).find(".studyResources").length > 0)
                        $(pathForm).find(".studyResources").detach();

                    for(var i = 0; i != this.value; i++) {
                       
                       
                        $(addStudyResource(
                            $(this).prop('id').substr(13), (i+1) ).appendTo("#studyEntry .studies:nth("+ activeIndex+ ") ul")
                         );
                    }
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

        $("#studyEntry").accordion({
            active: studyCount
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
        population:{
            required: "You must select at least one population",
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
                $(el).next().find('.custom-combobox-input, .ms-choice').addClass(errorClass);
        },
        unhighlight: function (el, errorClass,validClass) {
            if(el.id != "population" && el.id != "database_pathway")
                $(el).removeClass(errorClass);
            else
                $(el).next().find('.custom-combobox').children().andSelf().find('.error').removeClass(errorClass);
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

        return fileExtension == validExtension || fileExtension == "txt" ;
    }, jQuery.validator.format("You must upload a valid (.{0} or .txt) file."));

});
