// place all logic relating to appending, modifying
// or removing dynamic templates from the DOM here

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
                // what they enter for num_resource should
                // control the times addStudyResource is run
                $(el.parent().parent()[0]).append(
                    addStudyResource(el.prop('id').substr(13),(i+1))
                );
            }
        }
    });

    addStudy();// add first element by default

    function addStudy() {
        // get template element to use as a copy in actual form
        var studyTemplate = $("#snippets").find(".studies").clone();

        // get count of existing study elements
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

        // place new control before add button
        $("#studyEntry").append(studyTemplate);

        $("#studyEntry .studies:last")
            .find("input[id*='num_resource']")
            .on("change", function(e) {
            if(Number(this.value)) {
                var choice;
                if(this.value > 20)
                    choice = createConfirmationBox("Are you sure you want to specify " + this.value + " study resources for this study?");
                else
                    choice = true;

                if(choice) {
                    $("#studyEntry .studies:last .studyResources").remove();
                    if($(pathForm).find(".studyResources").length > 0)
                        $(pathForm).find(".studyResources").detach();


                    for(var i = 0; i != this.value; i++) {
                        // what they enter for num_resource should
                        // control the times addStudyResource is run
                        $($(this).parent().parent()[0]).append(
                            addStudyResource($(this).prop('id').substr(13),(i+1))
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

        // refresh accordion
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
        // remove the rules
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
