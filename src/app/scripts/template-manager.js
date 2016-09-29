// place all logic relating to appending, modifying
// or removing dynamic templates from the DOM here
function addStudy() {
    // get template element to use as a copy in actual form
    var studyTemplate = $("#snippets").find(".studies").clone();

    // get count of existing study elements
    var studyCount = $(pathForm).find(".studies").length;
    var studyIndex = studyCount + 1;

    studyTemplate.html(function (ind, htmlString) {
        // replacing all occurances with new study index
        return htmlString.replace("-1", "-" + studyIndex);
    });

    var firstResource = addStudyResource(studyIndex, 1);
    studyTemplate.children('ul').children('li').last().children('ul').append(firstResource);
    studyTemplate.find(".studyTitle").append(studyIndex);


    var studyLabel = studyTemplate.find('[for="study"]');
    studyLabel.attr("for", studyLabel.attr("for") + "_" + studyIndex);
    var studyId = studyTemplate.find("#study");
    studyId.attr("name", studyId.attr("id") + "_" + studyIndex).attr("id", studyId.attr("id") + "_" + studyIndex);

    var lambdaLabel = studyTemplate.find('[for="lambda"]');
    lambdaLabel.attr("for", lambdaLabel.attr("for") + "_" + studyIndex);
    var lambdaId = studyTemplate.find("#lambda");
    lambdaId.attr("name", lambdaId.attr("id") + "_" + studyIndex).attr("id", lambdaId.attr("id") + "_" + studyIndex);

    var numLabel = studyTemplate.find('[for="num_resource"]');
    numLabel.attr("for", numLabel.attr("for") + "_" + studyIndex);
    var numId = studyTemplate.find("#num_resource");
    numId.attr("name", numId.attr("id") + "_" + studyIndex).attr("id", numId.attr("id") + "_" + studyIndex);

    // place new control before add button
    $("#studyEntry").append(studyTemplate);

    $.each($('#studyEntry .studyResources input'), function (ind, el) {
        var rules = {
            messages: {}
        };
        
        if(el.id.indexOf("sample_size_") > -1) {
            rules.required = true;
            rules.digits = true;
            
            rules.messages.required = "The " + $(el).attr('aria-label') + " for Study " + el.id.charAt(12) + " is required";
            rules.messages.digits = "The " + $(el).attr('aria-label') + " for Study " + el.id.charAt(12) + " must be an integer";
        }
        
        if(el.id.indexOf("sample_case_") > -1 || el.id.indexOf("sample_control_") > -1) {
            rules.required = false;
            var studyInd = (el.id.indexOf("sample_case_") > -1) ? el.id.charAt(13) : el.id.charAt(15);
            rules.messages.required = "The " + $(el).attr('aria-label') + " for Study " + studyIndex + " is required";
        }
        
        $(el).rules("add", rules);
    });

    studyId.rules("add", {
        required: true,
        messages: {
            required: "A file is required for Study " + studyIndex,
        }
    });

    lambdaId.rules("add", {
        required: true,
        number: true,
        min: 1,
        messages: {
            required: "The Lambda value for Study " + studyIndex + " is required",
            number: "The Lambda value for Study " + studyIndex + " must be a number",
            min: "The Lambda value for Study " + studyIndex + " must be greater than or equal to 1"
        }
    });

    numId.rules("add", {
        required: true,
        number: true,
        min: 1,
        messages: {
            required: "The Number of Resources for Study " + studyIndex + " is required",
            number: "The Number of Resources for Study " + studyIndex + " must be a number",
            min: "The Number of Resources for Study " + studyIndex + " must be greater than or equal to 1"
        }
    });
    
    studyTemplate.find("input[name='family']").on('change', function (e) {
        var value = $(e.target).val();
        var req = (value == 'bionomial') ? true : false;

        $.each($("form .family input"), function (i, input) {
            $(input).rules("add", {
                required: req
            });
        });

        if (req)
            $(pathForm).find(".family").addClass("show");
        else
            $(pathForm).find(".family").removeClass("show");
    });

    // refresh accordion
    var activeIndex = $("#studyEntry").accordion("refresh").accordion({
        active: studyCount
    }).accordion("option", "active");

    studyTemplate.find("input[id*='num_resource']").on("change", function (e) {
        var elemId = $(this).prop('id');
        var id = elemId.substr(13);

        var valid = false;
        valid = $(this).validate().element('#' + elemId);
        if (valid) {
            var choice;
            if (this.value > 20)
                choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
            else
                choice = true;

            if (choice) {
				var resourceList = studyTemplate.find('.resource-list');
                removeValidators(resourceList.find('input'));
                resourceList.children('.studyResources').remove();

                for (var i = resourceList.children().length + 1; i <= this.value; i++) {
                    // what they enter for num_resource should
                    // control the number of times addStudyResource is run
                    resourceList = studyTemplate.find("resource-list");
                    var studyResource = addStudyResource(id, i);
                    resourceList.append(studyResource);

                    resourceList.find('input[id*="sample_size_'+ id + "_" +  i + '"]').rules("add", {
                        required: true,
                        digits: true,
                        messages: {
                            required: "The Sample Size for Resource #" + i + " is required",
                            digits: "The Sample Size for Resource #" + i + " must be an integer"
                        }
                    });

                    //add rules for case and control
                    resourceList.find('input[id*="sample_case_'+ id + "_" +  i + '"]').rules("add", {
                        required: false,
                        messages: {
                            required: "The Sample Size Case for Resource #" + i + " is required"
                        }
                    });

                    resourceList.find('input[id*="sample_control_'+ id + "_" +  i + '"]').rules("add", {
                        required: false,
                        messages: {
                            required: "The Sample Size Control for Resource #" + i + " is required"
                        }
                    });
                }
            }
        }
    });
}


function removeValidators(inputs) {
    $.each(inputs, function (ind, el) {
        el.value = "";
        $(el).rules("remove");
    });
}

function addStudyResource(study, ind) {
    var resource_element = $("#snippets").children(".studyResources").clone();

    var eLabels = resource_element.find("label");
    var eInputs = resource_element.find("input");

    resource_element.find('.resourceNum').text("Resource #" + ind);

    for (var controlId = 0; controlId < eInputs.length; controlId++) {
        // sample resources, cases and controls
        var elementLabel = $(eLabels[controlId]);
        var elementInput = $(eInputs[controlId]);

        var labelFor = elementLabel.attr("for") + "_" + study + "_" + ind;

        var inputId = elementInput.attr("id") + "_" + study + "_" + ind;

        elementLabel.attr("for", labelFor);
        elementInput.attr("id", inputId).attr("name", inputId);
    }

    return resource_element;
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
    $("button#addControl").on("click", function (e) {
        e.preventDefault();

        var previousValid = false;
        $("form .studies input").each(function (i, el) {
            previousValid = $(el).validate().valid();
            return previousValid;
        });

        if (previousValid) {
            addStudy();

            $("#studyEntry").accordion("option", "icons", {
                header: "ui-icon-triangle-1-e",
                activeHeader: "ui-icon-triangle-1-s"
            });
        }
        else {
            $("#studyEntry").accordion("option", "icons", {
                header: "ui-icon-alert",
                activeHeader: "ui-icon-alert"
            });
        }
    });
});