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
    firstResource.find('input').rules("add", {
        required: true,
        digits: true,
        messages: {
            required: "The sample size value is required",
            digits: "The sample size value must be an integer"
        }
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
        var id = $(this).prop('id');
        var valid = false;
        valid = $(this).validate().element('#' + id);
        if (valid) {
            var choice;
            if (this.value > 20)
                choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
            else
                choice = true;

            if (choice) {
                var resourceList = studyTemplate.find('ul.resource-list');
                resourceList.children('.studyResources:nth(' + (this.value - 1) + ') ~ .studyResources').remove();
                resourceList.find('input').each(function (i, el) {
                    el.value = '';
                });
                for (var i = resourceList.children().length + 1; i <= this.value; i++) {
                    // what they enter for num_resource should
                    // control the times addStudyResource is run
                    var studyResource = addStudyResource(id.substr(13), i);
                    resourceList.append(studyResource);

                    studyResource.find('input#sample_size_' + id.substr(13) +'_'+ i).rules("add", {
                        required: true,
                        digits: true,
                        messages: {
                            required: "The sample size value is required",
                            digits: "The sample size value must be an integer"
                        }
                    });

                    //add rules for case and control
//                    studyResource.find('input#sample_case_' + id.substr(13) + '_' + i).rules("add", {
//                        required: true,
//                        messages: {
//                            required: "The sample size case value is required"
//                        }
//                    });
//
//                    studyResource.find('input#sample_control_' + id.substr(13) + '_' + i).rules("add", {
//                        required: true,
//                        messages: {
//                            required: "The sample size control value is required"
//                        }
//                    });
                }
            }
        }
    });
    
    studyTemplate.find("input[name='family']").on('change', function(e){
        var value = $(e.target).val();
        if(value == 'bionomial')
            $(".family").addClass("show");
        else
            $(".family").removeClass("show");
    });
}

function addStudyResource(study, ind) {
    var resource_element = $("#snippets").children(".studyResources").clone();

    var eLabels = resource_element.find("label");
    var eInputs = resource_element.find("input");

    for (var controlId = 0; controlId < eInputs.length; controlId++) {
        // sample resources, cases and controls
        var elementLabel = $(eLabels[controlId]);
        var elementInput = $(eInputs[controlId]);

        var labelFor = elementLabel.attr("for") + "_" + study + "_" + ind;
        var labelText = elementLabel[0].innerHTML + " #" + ind + ":";

        var inputId = elementInput.attr("id") + "_" + study + "_" + ind;

        elementLabel.attr("for", labelFor);
        elementLabel.text(labelText);
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
    $(".addControl[title='study']")
        .button({
            text: true,
            icons: {
                primary: "ui-icon-circle-plus"
            }
        })
        .on("click", function (e) {
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