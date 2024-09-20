FilterManager = function(_defaultConfig, _data) {
  this.filters = _defaultConfig.attributes;
  this.data = _data;
  this.settings = {
    contextHeight: 50,
    margin: {left: 0, right: 0, top: 0, bottom: 0},
    padding: {left: 0, right: 5}
  };

  this.activeFilters = [];

  this.updateFilters();
}


// This function creates the "Remove all Filters" button
FilterManager.prototype.createRemoveAllFiltersButton = function() {
  var manager = this;
  var removeAllButton = '<button id="remove-all-filters" class="uk-button uk-button-small uk-align-right">Reset Filters</button>';
  
  // Appending the button to the filter-controls container
  $("#bfilter").append(removeAllButton);

  // Adding an event listener to the button to clear all active filters
  $("#remove-all-filters").on("click", function() {
    manager.clearAllFilters();
    updateViews();  // Assuming this function updates the view when filters are changed
  });
}


// This function clears all active filters
FilterManager.prototype.clearAllFilters = function() {
  var manager = this;

  // Reset all filters and their selected values
  manager.filters.forEach(function(filterElem) {
    if(filterElem.type=="range_slider"){
      
      var slider = document.getElementById("range-slider-" + filterElem.key);
      slider.noUiSlider.reset();
    }
    filterElem.active = false;
    filterElem.selectedValues = null;
  });

  // Clear active filters array
  manager.activeFilters = [];
  $(".filter-checkbox-label input").prop('checked', true);  // Reset checkboxes
  $(".filter-button-group button").removeClass('active');    // Reset multi-select buttons

  // Reset all filter elements
  manager.filters.forEach(function(filterElem) {
    //console.log(filterElem.type)
    if(filterElem.type=="range_slider"){
      //console.log(filterElem.selectedValues)
      //Object.keys(filterElem).forEach((prop)=> console.log(prop));
    }
    filterElem.active = false;
    filterElem.selectedValues = null;
  });
  updateViews();
  console.log("All filters removed");
}

// Highlighted Change: Call createRemoveAllFiltersButton in updateFilters
FilterManager.prototype.updateFilters = function() {
  var manager = this;

  // Filter only active filters
  manager.filters = manager.filters.filter(function(d) {
    return d.filter == true;
  });

  // Nest filters by parent
  manager.nestedFilters = d3.nest()
    .key(function(d) { return d.parent; })
    .entries(manager.filters);

  // Clear current filters from the UI
  $("#filter-controls").empty();

  // Call the new function to create the "Remove all Filters" button
  manager.createRemoveAllFiltersButton(); // Highlighted Change: Adding the button

  // Render the nested filter groups
  manager.nestedFilters.forEach(function(filterGroup) {
    $("#filter-controls").append('<div id="' + filterGroup.key + '"></div><hr>');

    filterGroup.values.forEach(function(filterElem) {
      switch(filterElem.type) {
        case "range_slider":
          manager.createRangeSlider(filterElem, filterGroup.key);
          break;
        case "multi_select":
          manager.createMultiSelect(filterElem, filterGroup.key);
          break;
        case "checkbox":
          manager.createCheckboxFilter(filterElem, filterGroup.key);
          break;
        default:
          console.log("do nothing");
      }
    });
  });
}

FilterManager.prototype.createMultiSelect = function(filterElem, filterGroup) {
  var manager = this;

  var multiSelectButtons = "";

  filterElem.values.forEach(function(filterOptions) {
    var activeClass = filterOptions.checked ? "active" : "";
    multiSelectButtons += '<button class="uk-button uk-button-small active'+ activeClass +'" data-value="'+ filterOptions.value +'"><span>'+ filterOptions.title +'</span></button>';
  });

  var titleWidth = filterElem.customWidth ? filterElem.customWidth.title : "uk-width-1-4";
  var uiWidth = filterElem.customWidth ? filterElem.customWidth.ui : "uk-width-3-4";
  var customizeMargins = "";
  var filterTitle = filterElem.title;
  var valueMatching = filterElem.valueMatching ? 'data-matching="'+ filterElem.valueMatching +'"' : "";

  var filterResult = '<div class="filter filter-multi-select" uk-grid>\
    <div class="'+ titleWidth +' filter-title uk-margin-right">'+ filterTitle +'</div>\
    <div class="'+ uiWidth +' uk-button-group filter-button-group uk-child-width-1-'+ filterElem.values.length +' '+ customizeMargins +' " uk-grid-collapse uk-grid data-filter="'+ filterElem.key +'" '+ valueMatching +'>'+ multiSelectButtons +'</div>\
  </div>';

  $('[id="'+ filterGroup +'"]').append(filterResult);
}

FilterManager.prototype.createCheckboxFilter = function(filterElem, filterGroup) {
  var manager = this;
  
  var checkboxFilterDomain = manager.data.nodes.map(d => d[filterElem.key]);
  checkboxFilterDomain = [].concat.apply([], checkboxFilterDomain);
  checkboxFilterDomain = [...new Set(checkboxFilterDomain)].sort();
  
  var checkboxes = "";
  
  var elementsPerColumn = checkboxFilterDomain.length / 2;
  
  checkboxFilterDomain = checkboxFilterDomain.filter(function(d) {
    return d != null;
  });

  checkboxFilterDomain.forEach(function(filterValue, index) {
    // if(index == elementsPerColumn) {
    //   checkboxes += '</div><div>';
    //   elementsPerColumn = 1000;
    // }
    checkboxes += '<div><label class="filter-checkbox-label"><input class="uk-checkbox checkbox-small" value="'+ filterValue +'" type="checkbox" checked> <span>'+ filterValue +'</span></label></div>';
  });
  
  // if(filterElem.title) {
    var filterResult = '<div class="filter filter-checkboxes filter-checkboxes-full" data-filter="'+ filterElem.key +'"><div class="filter-title">'+ filterElem.title +'</div><div class="uk-grid-small" uk-grid>'+ checkboxes +'</div></div>';
  // } else {
  //   var filterResult = '<div class="filter filter-checkboxes filter-checkboxes-full uk-child-width-1-2@l" data-filter="'+ filterElem.key +'" uk-grid><div>'
  //     + checkboxes +'</div></div>';
  // }
  
  $('[id="'+ filterGroup +'"]').append(filterResult);
  // $('[data-filter-group="'+ filterGroup +'"] .uk-accordion-content').append(filterResult);
}

FilterManager.prototype.createRangeSlider = function(filterElem, filterGroup) {
  var manager = this;

  methodsWYear = manager.data.nodes.filter(function(d){
    return true;
    // return d[filterElem.key]==""? false:true;
  });

  if(filterElem.key == "year") {
    manager.createFrequencyPlot(filterElem, filterGroup, methodsWYear);
    var rangeSliderDomain = d3.extent(methodsWYear, function(d) {return parseInt(d[filterElem.key])});
  
  // console.log (rangeSliderDomain);

  var titleWidth = filterElem.customWidth ? filterElem.customWidth.title : "uk-width-1-4";
  var uiWidth = filterElem.customWidth ? filterElem.customWidth.ui : "uk-width-3-4";

  var filterResult = '<div id="filter-grid-'+filterElem.title.toLowerCase()+'" class="filter filter-range uk-grid-collapse" uk-grid>\
      <div class="'+ titleWidth +' filter-title">' + filterElem.title + '</div>'+
      '<div class="'+ uiWidth +'">'+
        // '<div class="uk-margin-small-right"><span>'+rangeSliderDomain[0]+'</span></div>'+
        // <div><input type="number" min="'+ rangeSliderDomain[0] +'" max="'+ rangeSliderDomain[1] +'" step="1" class="filter-range-input filter-range-input-min uk-margin-small-right" value="'+ rangeSliderDomain[0] +'"></div>\
        '<div class="uk-width-expand" id="range-slider-'+ filterElem.key +'"></div>'+
        // '<div class="uk-margin-small-left"><span>'+rangeSliderDomain[1]+'</span></div>'
        // <div><input type="number" min="'+ rangeSliderDomain[0] +'" max="'+ rangeSliderDomain[1] +'" step="1" class="filter-range-input filter-range-input-max uk-margin-left" value="'+ rangeSliderDomain[1] +'"></div>\
      '</div>\
    </div>';
  
  $('[id="'+ filterGroup +'"]').append(filterResult);

  var sliderContainer = document.getElementById("range-slider-"+ filterElem.key);

  var slider = noUiSlider.create(sliderContainer, {
    start: rangeSliderDomain,
    behaviour: 'drag-tap',
    connect: true,
    tooltips: true,
    step:1,
    range: {
      'min': rangeSliderDomain[0],
      'max': rangeSliderDomain[1]
    },
    format: wNumb({
        decimals: 0
    })
  });

  slider.on('update', function(values, handle) {
    $(sliderContainer).closest(".filter").find(".filter-range-input-min").val(parseInt(values[0]));
    $(sliderContainer).closest(".filter").find(".filter-range-input-max").val(parseInt(values[1]));
  });
  slider.on('end', function(values, handle) {
    if(values[0] == rangeSliderDomain[0] && rangeSliderDomain[1] == parseInt(values[1])) {
      fM.removeActiveFilter(filterElem.key);
    } else {
      fM.addActiveFilter(filterElem.key, [parseInt(values[0]),parseInt(values[1])]);
    }
    updateViews();
  });
  return
  }

  // Modify this to handle float values
  var rangeSliderDomain = d3.extent(methodsWYear, function(d) { return parseFloat(d[filterElem.key]); });
  
  var titleWidth = filterElem.customWidth ? filterElem.customWidth.title : "uk-width-1-4";
  var uiWidth = filterElem.customWidth ? filterElem.customWidth.ui : "uk-width-3-4";

  var filterResult = '<div id="filter-grid-'+filterElem.title.toLowerCase()+'" class="filter filter-range uk-grid-collapse" uk-grid>\
      <div class="'+ titleWidth +' filter-title">' + filterElem.title + '</div>'+
      '<div class="'+ uiWidth +'">'+
        '<div class="uk-width-expand" id="range-slider-'+ filterElem.key +'"></div>'+
      '</div>\
    </div>';
  
  $('[id="'+ filterGroup +'"]').append(filterResult);

  var sliderContainer = document.getElementById("range-slider-"+ filterElem.key);

  var slider = noUiSlider.create(sliderContainer, {
    start: rangeSliderDomain,
    behaviour: 'drag-tap',
    connect: true,
    tooltips: true,
    // Modify the step to allow for float precision if needed
    step: 0.01, // Adjust the step based on your precision needs
    range: {
      'min': rangeSliderDomain[0],
      'max': rangeSliderDomain[1]
    },
    format: wNumb({
        decimals: 2 // Update the number of decimals to show in the slider tooltip
    })
  });

  slider.on('update', function(values, handle) {
    // Modify to handle float values
    $(sliderContainer).closest(".filter").find(".filter-range-input-min").val(parseFloat(values[0]));
    $(sliderContainer).closest(".filter").find(".filter-range-input-max").val(parseFloat(values[1]));
  });

  slider.on('end', function(values, handle) {
    // Modify to handle float values
    if(values[0] == rangeSliderDomain[0] && rangeSliderDomain[1] == parseFloat(values[1])) {
      fM.removeActiveFilter(filterElem.key);
    } else {
      fM.addActiveFilter(filterElem.key, [parseFloat(values[0]), parseFloat(values[1])]);
    }
    updateViews();
  });
}


FilterManager.prototype.createFrequencyPlot = function(filterElem, filterGroup, data) {
  manager = this;
  var divResult = '<div class="histogram uk-grid-collapse" uk-grid>\
      <div class="uk-width-1-4 filter-title"></div>\
      <div class="uk-width-3-4" id="year-histogram"></div>\
      </div>';
  $('[id="'+ filterGroup +'"]').append(divResult);

  var parentElem = 'year-histogram'//'range-slider-'+filterElem.key;

  var width = document.getElementById(parentElem).clientWidth- manager.settings.margin.left - manager.settings.margin.right;
  console.log("width: "+width);

  manager.svgContainer = d3.select("#" + parentElem).append("svg")
                                                    .attr("width", width)
                                                    .attr("height", manager.settings.contextHeight + manager.settings.margin.top + manager.settings.margin.bottom);
  manager.scent = manager.svgContainer.append("g").attr("class", "scent")
                                                  .attr("transform",
                                                  "translate(" + manager.settings.margin.left + "," + manager.settings.margin.top + ")");

  

  var histogramDomain = d3.extent(data, function(d) {return parseInt(d[filterElem.key])});
  numTicks = histogramDomain[1] - histogramDomain[0];
  // console.log(histogramDomain)

  var x = d3.scaleLinear()
            .domain([histogramDomain[0],histogramDomain[1]+1])
            .range([0, width]);
  console.log(histogramDomain);
  manager.histogram = d3.histogram()
                        .value(function(d) { return d[filterElem.key]; })
                        .domain(x.domain())  // then the domain of the graphic
                        .thresholds(x.ticks(numTicks)); // then the numbers of bins

  var bins = manager.histogram(data);
  // console.log(bins)
  var y = d3.scaleLinear()
      .range([manager.settings.contextHeight,0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

  // append the bar rectangles to the svg element
  manager.scent.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { 
          // console.log("translate(" + x(d.x0) + "," + y(d.length) + ")");
          return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { 
          // console.log("width: "+d.x1+" "+(x(d.x1) - x(d.x0)+1));
          return x(d.x1) - x(d.x0) ; })
        .attr("height", function(d) { 
          return manager.settings.contextHeight - y(d.length); })
        .style("fill", "grey");
}


FilterManager.prototype.addActiveFilter = function(activeFilterKey, selectedFilterValues) {
  var manager = this;
  
  for(let filterElem of manager.filters) {
    if (filterElem.key == activeFilterKey) {
      filterElem.active = true;
      filterElem.selectedValues = selectedFilterValues;
      manager.activeFilters= selectedFilterValues;
      break;
    }
  }

  console.log(manager.activeFilters)
}

FilterManager.prototype.removeActiveFilter = function(oldFilterKey) {
  var manager = this;
  var filterIndex = -1;

  for (var i = 0; i < manager.activeFilters.length; i++) {
    if (manager.activeFilters[i] === oldFilterKey) {
      filterIndex = i;
      break;
    }
  }

  if (filterIndex !== -1) {
    manager.activeFilters.splice(filterIndex, 1); // Remove the entire element at the index
  }

  for (let filterElem of manager.filters) {
    if (filterElem.key == oldFilterKey) {
      filterElem.active = false;
      filterElem.selectedValues = null;
      break;
    }
  }
  console.log(manager.activeFilters);
}