// place all logic relating to appending, modifying
// or removing dynamic templates from the DOM here
function addStudy() {
    // get template element to use as a copy in actual form
    var studyTemplate = $("#snippets").find(".studies").clone();

    // get count of existing study elements
    var studyCount = $(pathForm).find(".studies").length;
    var studyIndex = studyCount + 1;

    studyTemplate.find(".studyTitle").append(studyIndex);

    studyTemplate.find("label, input").each(function (i, el) {
        if (this.tagName.toLowerCase() == "label") {
            var forAttr = $(el).attr("for") + "_" + studyIndex;
            $(el).attr("for", forAttr);
        }
        if (this.tagName.toLowerCase() == "input") {
            var newId = $(el).attr("id") + "_" + studyIndex;
            $(el).attr("id", newId).attr("name", newId);
        }
    });

    // place new control before add button
    $("#studyEntry").append(studyTemplate);

    studyTemplate.find("input, select").each(function (i, el) {
        if (this.type == "file") {
            $(this).rules("add", {
                required: true,
                messages: {
                    required: "The " + this.id + " field is required",
                }
            });
        } else {
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
                var resourceList = studyTemplate.find('ul.resource-list').empty();
                for (var i = 1; i <= this.value; i++) {
                    // what they enter for num_resource should
                    // control the times addStudyResource is run
                    addStudyResource(id.substr(13), i).appendTo(resourceList);

                    $("#sample_size_" + id.substr(13) + "_" + i).rules("add", {
                        digits: true,
                        messages: {
                            digits: "The sample size value must be an integer",
                        }
                    });
                }
            }
        }
    });
    studyTemplate.find(".addControl[title='resource']").button({
        text: false,
        icons: {
            primary: "ui-icon-circle-plus"
        }
    }).on("click", function (e) {
        e.preventDefault();

        var el = $(this);
        var previousValid = false;
        var resource_tb = $(this).prev();
        var validator = resource_tb.validate();

        previousValid = validator.element("#" + resource_tb.prop('id'));

        var resourceValue = resource_tb.val();

        if (previousValid) {
            var resourceList = el.parent().next().empty();
            for (var i = 1; i <= resourceValue; i++) {
                // what they enter for num_resource should
                // control the times addStudyResource is run
                resourceList.append(
                    addStudyResource(resource_tb.prop('id').substr(13), i)
                );
            }
        }
    });
}

function addStudyResource(study, ind) {
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
    // remove the rules
    parentElement.find(".studyResources:nth(" + ind + ") input").each(function () {
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
