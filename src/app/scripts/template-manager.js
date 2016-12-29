// place all logic relating to appending, modifying
// or removing dynamic templates from the DOM here

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

            //$("#uploadStatus").html(progressBar);
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
                // display integrity check result
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