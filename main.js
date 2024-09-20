//variables and default settings
 var originalData_nodes, originalData_links, originalData_attribute_groups, mydata,defaultAttrConfig;
 var galleryVis, fM, formM;
 var defaultConfig = {};
// read data
 Promise.all([
     d3.json("./data/Typingdatafin.json"),
     d3.json("./data/newTextfilter.json")
	]).then(function(files) { 
		data = files[0];
		defaultAttrConfig = files[1];

		originalData_nodes = data.nodes;
		originalData_links = data.links;
		mydata = data;

		//initialize filtermanger
		 fM = new FilterManager(defaultAttrConfig, mydata);
		 //formM = new FormManager(defaultAttrConfig,"myform-fields", mydata);

		//initialize views
		 $("#n-methods").text("(" + data.nodes.length + ")");
		 galleryVis = new Gallery("gallery-vis", mydata, defaultAttrConfig);
     updateViews()

	});

  function filterNodes() {
    nodes = originalData_nodes;
    links = originalData_links;
  
    nodes = nodes.filter(function(d) {
      var decision = true;
  
      fM.filters
        .filter(function(d) {
          return d.active;
        })
        .forEach(function(activeFilter) {
          switch(activeFilter.valueMatching) {
  
            // Array intersection logic: check if at least one value overlaps between two arrays
            case "arrayIntersection":
              
              if (!d[activeFilter.key] || !Array.isArray(d[activeFilter.key])) {
                decision = false;
                break;
              }
              // Check if there is any overlap between selectedValues and the node's array
              const intersection = d[activeFilter.key].some(value => activeFilter.selectedValues.includes(value));
              if (!intersection) {
                decision = false;
              }
              break;
  
            // Range check (kept as it was)
            case "range":
              if (d[activeFilter.key] < activeFilter.selectedValues[0] || d[activeFilter.key] > activeFilter.selectedValues[1])
                decision = false;
              else if (d[activeFilter.key] == null)
                decision = false;
              break;
  
            // Default case: checking for an array match instead of an exact match
            default:
              
              if (Array.isArray(d[activeFilter.key])) {
                
                // Check if at least one element in the node's array matches the selected values
                const arrayMatch = d[activeFilter.key].some(value => activeFilter.selectedValues.includes(value));
                if (!arrayMatch) {
                  decision = false;
                }
              } else {
                // Fallback for non-array values (exact match)
                if (!activeFilter.selectedValues.includes(d[activeFilter.key])) {
                  decision = false;
                }
              }
          }
        });
  
      return decision;
    });
  
    // Filter links based on the filtered nodes
    var currNodes = nodes.map(node => node.id);
  
    links = links.filter(function(d) {
      var decision = true;
      if (!currNodes.includes(d.source) || !currNodes.includes(d.target)) {
        decision = false;
      }
      return decision;
    });
  
    mydata.nodes = nodes;
    mydata.links = links;
    mydata.attribute_groups = originalData_attribute_groups;
  }
  

function updateViews() {

	filterNodes();
	$("#n-methods").text("(" + data.nodes.length + ")");

	//update visualizations
	galleryVis.data = mydata;
	galleryVis.wrangleDataAndUpdate();
}


/*** Sidebar filter ***/

// Multi-select
$("#filter-controls").on("click", ".filter-button-group .uk-button", function () {
  $(this).toggleClass("active");
  var currFilter = $(this).parent().attr("data-filter");
  
  // Collect all active buttons
  var multiSelectValues = $(this).parent().children(".active").map(function() {
    return $(this).attr("data-value");
  }).get();


  //var customValueMatching = $(this).parent().data("matching") || "inArray";
  
  var nOfOptions = $(this).parent().children().length;
  if(nOfOptions == multiSelectValues.length || multiSelectValues.length == 0) {
    fM.removeActiveFilter(currFilter);
  } else {
    fM.addActiveFilter(currFilter, multiSelectValues);
   }
  updateViews();
});


$("#filter-controls").on("change", ".filter-checkboxes input:checkbox", function () {
  var parentElementSelector = $(this).closest(".filter-checkboxes");
  var currFilter = parentElementSelector.attr("data-filter");
  var enabledCheckboxes = getEnabledCheckboxes('.filter-checkboxes[data-filter="'+ currFilter +'"]', null);
  var nOfOptions = parentElementSelector.find("input:checkbox").length;

  if(nOfOptions == enabledCheckboxes.length || enabledCheckboxes.length == 0) {
    //cM.removeParam(currFilter);
    fM.removeActiveFilter(currFilter);
  } else {
    //cM.setParam(currFilter, enabledCheckboxes.join(","));
    fM.addActiveFilter(currFilter, enabledCheckboxes);
    //fM.addActiveFilter({ key: currFilter, values: enabledCheckboxes.join(","), valueMatching: "arrayIntersection" });
  }
  updateViews();
});

function getEnabledCheckboxes(parentElement, dataAttribute) {
  var checkboxValues = $(parentElement + " input:checkbox:checked").map(function() {
    return dataAttribute ? $(this).attr("data-" + dataAttribute) : $(this).val();
  }).get();

  return checkboxValues;
}

function generateMethodToolTip(method){
  
  if(method=="none")
    return "";

  methodThumbnail = '<div class="uk-cover-containerx tooltip__thumbnail"><img src="./Gifs/' +  method.figure + '" alt=""></div>'
  button = '<button id="details-btn" class="uk-button uk-button-small">See details</button>'
  result = '<div class="uk-card uk-card-default uk-card-small tooltip__card">'
            + methodThumbnail
            +button
            +'</div>';
  return result;
}

