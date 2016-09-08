// place all logic relating to appending, modifying
// or removing dynamic templates from the DOM here
function addStudy() {
    // get template element to use as a copy in actual form
    var studyTemplate = $("#snippets").find(".studies").clone();

    // get count of existing study elements
    var studyCount = $(pathForm).find(".studies").length;
    var studyIndex = studyCount + 1;

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

    $.each(firstResource.find('input'), function (ind) {
        var ctrl = firstResource.find('input')[ind];
        $(ctrl).rules("add", {
            required: true,
            digits: true,
            messages: {
                required: "The " + ctrl.labels[0].innerText + " is required",
                digits: "The " + ctrl.labels[0].innerText + " must be an integer"
            }
        });
    });

    studyId.rules("add", {
        required: true,
        messages: {
            required: "The " + studyId.attr('id') + " field is required",
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

    numId.rules("add", {
        required: true,
        number: true,
        min: 1,
        messages: {
            required: "The " + numId.attr('id') + " field is required",
            number: "The " + numId.attr('id') + " value must be a number",
            min: "The " + numId.attr('id') + " value must be greater than or equal to 1"
        }
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
                var resourceList = studyTemplate.find('ul.resource-list');
                
                removeValidators(resourceList.find('input'));
                resourceList.children('.studyResources:nth(' + (this.value - 1) + ') ~ .studyResources').remove();

                for (var i = resourceList.children().length + 1; i <= this.value; i++) {
                    // what they enter for num_resource should
                    // control the number of times addStudyResource is run
                    var studyResource = addStudyResource(id, i);
                    resourceList.append(studyResource);

                    studyResource.find('input#sample_size_' + id + '_' + i).rules("add", {
                        required: true,
                        digits: true,
                        messages: {
                            required: "The sample size value for Resource #" + i + " is required",
                            digits: "The sample size value for Resource #" + i + " must be an integer"
                        }
                    });

                    //add rules for case and control
                    studyResource.find('input#sample_case_' + id + '_' + i).rules("add", {
                        required: {
                            depends: checkFamilyValue
                        },
                        messages: {
                            required: "The sample size case value for Resource #" + i + " is required"
                        }
                    });

                    studyResource.find('input#sample_control_' + id + '_' + i).rules("add", {
                        required: {
                            depends: checkFamilyValue
                        },
                        messages: {
                            required: "The sample size control value for Resource #" + i + " is required"
                        }
                    });
                }
            }
        }
    });

    studyTemplate.find("input[name='family']").on('change', function (e) {
        var value = $(e.target).val();
        if (value == 'bionomial')
            $(".family").addClass("show");
        else
            $(".family").removeClass("show");
    });
}

function removeValidators(inputs){
    $.each(inputs,function(ind, el){
        el.value = "";
        $(el).rules("remove");
    });
}

function checkFamilyValue(ctrl) {
    return $(ctrl.form).find("input[name='family']:checked").val() == 'bionomial';
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
    $("button.addControl").on("click", function (e) {
            e.preventDefault();

            var previousValid = false;
            $(pathForm).find(".studies input").each(function (i, el) {
                previousValid = $(el).validate().element("#" + el.id);
                return previousValid;
            });

            if (previousValid)
                addStudy();
        });
});