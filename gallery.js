Gallery = function(_parentElement, _data, _attrConfig) {
  this.data = _data;
  this.attrConfig = _attrConfig; 
  // console.log(this.attrConfig);

  this.settings = {
    parentElement: _parentElement,
  }

  this.initVis();
}


Gallery.prototype.initVis = function() {
  var vis = this;
  
  vis.wrangleDataAndUpdate();
}

Gallery.prototype.wrangleDataAndUpdate = function() {
  var vis = this;
  // console.log(vis.data.nodes)
  vis.data.nodes = vis.data.nodes.sort((a,b)=> (a.group<b.group) ? -1: ((a.group>b.group) ? 1:0));
  vis.updateVis();

}

Gallery.prototype.updateVis = function() {
  var vis = this;
  
  vis.my_galleryitems = d3.select("#" + vis.settings.parentElement).selectAll(".gallery-item-block")
      .data(vis.data.nodes);

  // console.log("in gallery")
  // console.log(vis.my_galleryitems)

  vis.my_galleryitems.exit().remove();
  
  var galleryItem_enter = vis.my_galleryitems.enter().append("div")
      .attr("class", "gallery-item-block");

  galleryItem_enter.merge(vis.my_galleryitems)
			      .html(function(d) {
			      	 // var resizedFiguresPath = d.figure;
               var methodThumbnail = '<div class="uk-cover-containerx gallery-item__thumbnail"><div class="uk-transition-toggle" tabindex="0"><img loading="lazy" src="./Gifs/' +  d.figure + '" alt=""><div class="uk-transition-fade uk-position-cover uk-overlay uk-overlay-primary uk-flex uk-flex-center uk-flex-middle"><div class="uk-position-center uk-panel"><p class="uk-transition-slide-bottom-small" style="text-align: center;">'+d.id+'</p></div></div></div></div>';

			      	 // if(d.figure.length>0)
			        //  	var methodThumbnail = '<div class="uk-cover-containerx gallery-item__thumbnail"><img src="./Gifs/' +  d.figure[0] + '" alt=""></div>';
			        //  else
			        //  	var methodThumbnail = "";

              // return '<div class="gallery-item uk-card uk-card-default uk-card-small uk-height-small" data-method="'+ d.id +'" data-method-id="'+ d.id +'" id="g-item'+ d.number +'">'
              //         + '<div class="gallery-item__header uk-padding-small">' + d.id + '</div>'
              //         + methodThumbnail
              //         +'</div>';

               return '<div class="gallery-item uk-card uk-card-default uk-card-small" data-method="'+ d.id +'" data-method-id="'+ d.id +'" id="g-item'+ d.number +'">'
                      + methodThumbnail
                      +'</div>';
    			    })
            .on('mouseover', function (d) {
                d3.select("#g-item"+d.number).style('border-style', 'solid').style('border-width', 'thin').style('border-color','grey');
            })
            .on('mouseout', function (d) {
                d3.select("#g-item"+d.number).style('border-style', 'none');
            })
            .on('click', function(d){
              // console.log(vis.attrConfig)
              showLocomotionModal(d.id,d,vis.attrConfig)
            });
}