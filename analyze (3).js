var clarifaiApiKey = 'e5c9bf47e214475c9a22a132019b7060';
var workflowId = 'workflow-mars';

var app = new Clarifai.App({
  apiKey: clarifaiApiKey
});

// Handles image upload
function uploadImage(get_img) {
  //var preview = document.querySelector('img');
  //var file = document.querySelector('input[type=file]').files[0];
  //var file = get_img;
  //var reader = new FileReader();
  predictFromWorkflow(get_img);

  /*if (file) {
    reader.readAsDataURL(file);
    preview.style.display = "inherit";
  }*/
}

// Analyzes image provided with Clarifai's Workflow API
function predictFromWorkflow(photoUrl) {
  app.workflow.predict(workflowId, photoUrl).then(
      function(response){
        var outputs = response.results[0].outputs;
        var analysis = $(".analysis");

        analysis.empty();
        console.log(outputs);

        outputs.forEach(function(output) {
          var modelName = getModelName(output);

          // Create heading for each section
          var newModelSection = document.createElement("div");
          newModelSection.className = modelName + " modal-container";

          var newModelHeader = document.createElement("h2");
          newModelHeader.innerHTML = modelName;
          newModelHeader.className = "model-header";

          var formattedString = getFormattedString(output);
          var newModelText = document.createElement("p");
          newModelText.innerHTML = formattedString;
          newModelText.className = "model-text";

          newModelSection.append(newModelHeader);
          newModelSection.append(newModelText);
          analysis.append(newModelSection);
        });
      },
      function(err){
        console.log(err);
      }
  );
}

// Helper function to get model name
function getModelName(output) {
  if (output.model.display_name !== undefined) {
    return output.model.display_name;
  } else if (output.model.name !== undefined) {
    return output.model.name;
  } else {
    return "";
  }
}

// Helper function to get output customized for each model
function getFormattedString(output) {
  var formattedString = "";
  var data = output.data;
  var maxItems = 10;
  // General
  if ({id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40"}) {
    var items = data.concepts;
    if (items.length < maxItems) {
      maxItems = items.length;
      if (maxItems === 1) {
        formattedString = "The thing we are most confident in detecting is:";
      }
    } else {
      formattedString = "The " + maxItems + " things we are most confident in detecting are:";
    }

    for (var i = 0; i < maxItems; i++) {
      formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
    }
  } 

   // Textures & Patterns
   else if (output.model.model_version.id === "b38274b04b1b4fb28c1b442dbfafd1ef") {
    var items1 = data.concepts;
    if (items1.length < maxItems) {
      maxItems = items.length;
      if (maxItems === 1) {
        formattedString = "The texture or pattern we are most confident in detecting is:";
      }
    } else {
      formattedString = "The " + maxItems + " textures and/or patterns we are most confident in detecting are:";
    }

    for (var j = 0; j < maxItems; j++) {
      formattedString += "<br/>- " + items[i].name + " at a " + (Math.round(items[i].value * 10000) / 100) + "% probability";
    }
  }
  
// General Embedding
  else if (output.model.model_version.id === "bb7ac05c86be42d38b67bc473d333e07") {
    formattedString = "Open up the console to see an array of numerical vectors representing the input image in a 1024-dimensional space.";
    console.log("*** General Embedding Output ***");
    console.log(data.embeddings[0]);
  }
  // Landscape Quality
  else if (output.model.model_version.id === "a008c85bb6d44448ad35470bcd22666c") {
    var items2 = data.concepts;
    formattedString = "The probability that this photo's landscape is:";
    for (var k = 0; k < items.length; k++) {
      formattedString += "<br/>- " + items2[k].name + " is " + (Math.round(items2[k].value * 10000) / 100) + "%";
    }
  }

  return formattedString;
}