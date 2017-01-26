// a global variable
var data;

// function to draw the actual map
function Draw_Map(year, data, industry){

		map = new Datamap({
			element: document.getElementById("map"),
			projection: 'mercator',

			//fills: choose_color(industry),
			fills: {defaultFill: 'lightgrey'},

			// retrieve correct data from json
			data: Worldmap_Data(year, data, industry),

			// create pop up template
			geographyConfig: {
					popupTemplate: function(geo, data) {
							return ['<div class="hoverinfo"><strong>' + data.name,
											'</strong><br/>Total CO2 emission: ' + data.industry + ' MtCO2',
											'</div>'].join('');
					},
					popupOnHover: true,
	        highlightOnHover: true,
	        highlightFillColor: 'darkblue',
	        highlightBorderColor: 'white',
	        highlightBorderWidth: 1,
	        highlightBorderOpacity: 1}

		});
		//map.legend();


}

// function to put data in appropriate format for line chart
function Linechart_Data(data, countrycode, continent){

	// because the JSON has two keys you have to retrieve the data via year (1st key) and then via continent (2nd key)
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

	var continent_number = continents.indexOf(continent);

	var Year;
	for (Year = 1992; Year < 2013; Year++){
		//console.log(data[Year][continent_number][continent]);
	}
	//console.log(data.items);
	//console.log(countrycode);

}

// separate function to load the correct data from the json if user has given a year
function Worldmap_Data(year, data, industry) {

	// because the JSON has two keys you have to retrieve the data via year (1st key) and then via continent (2nd key)
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

	//create new object to store data in
	var data_per_year = new Object;

	// array to put all values in to determine min and max
	var all_values = [];

	// loop through all continents
	for (i = 0; i < 6; i++){

		// loop through all items per continent
		data[year][i][continents[i]].forEach(function(d){

			// push all values
			all_values.push(d[industry]);
		});
	};

	// determine min and max value for coloring
	var minValue = Math.min.apply(null, all_values),
					maxValue = Math.max.apply(null, all_values);

	// use different color schemes
	var color_range = {blue: ['#EFEFFF','#02386F'],
										green: ['#edf8e9','#005a32'],
											red: ['#fee5d9','#99000d'],
									 purple: ['#f2f0f7','#4a1486'],
								 	 orange: ['#feedde','#8c2d04'],
									  black: ['#f7f7f7','#252525']};

	// asign a different colorscheme to every industry
	var industry_color = {totalCO2: 'blue',
								 electricandheat: 'green',
								 	 manufacturing: 'red',
								 	transportation: 'purple',
							 		fuelcombustion: 'orange',
						 						fugitive: 'black'};

	// linear and variable color scale
	var paletteScale = d3.scale.linear()
            .domain([minValue, maxValue])
            .range(color_range[industry_color[industry]]);

	// now save data per country and assign color
	for (j = 0; j < 6; j++){

		// store data from one year per country in new object
		data[year][j][continents[j]].forEach(function(d){

			// save data per country in new json format
			data_per_year[d.ccode] = {
				name : d.name,
				//continent: continents[i],
				fillColor: paletteScale(parseFloat(d[industry])),
				industry: industry,
				value: d[industry]
			};

		});
	};
	// return data
	return data_per_year;
}

// function to retrieve data in appropriate parent-> children format for sunburst
function Sunburst_Data(year, data){

	// create object in which I place formatted data
	var sunburst_data = new Object;

	// create two arrays which makes accessing JSON data easier
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
	var industries = ["totalCO2", "electricandheat", "manufacturing", "transportation", "fuelcombustion", "fugitive"];

	// create array in which we can store the continent objects
	var continents_total = [];

	// loop through all continents per the given year and put format in appropriate object for sunburst
	for (i = 0; i < continents.length ; i++) {

		// every time create new continent object else it overwrites
		var continent_parent = new Object;

		// create array in which we can store the country objects
		var country_per_continent = [];

		// define number of countries per continent
		var numb_countries = data[year][i][continents[i]].length;

		// loop through every country per continent
		for (a = 0; a < numb_countries; a++){

			// for some reason you have to create a new object every time
			var country_parent = new Object;

			// define country object
			var country_object = data[year][i][continents[i]][a];

			// put every single emission from a country in a different object and place that object in an array
			var country_emission = [];

			// loop through the numbers per country
			for (z = 0; z < 6; z ++){

				// create new object every time, else it replaces
				var emission_per_industry = new Object;

				// put emission type and emission number in object
				emission_per_industry.name = industries[z];
				emission_per_industry.size = Number(country_object[industries[z]]);

				// put the object in the array from the corresponding country
				country_emission[z] = emission_per_industry;
			}

			// one country is a children from the continent
			country_parent["children"] = country_emission;
			country_parent.name = data[year][i][continents[i]][a].name;
			country_parent.ccode = data[year][i][continents[i]][a].ccode;

			// put all countries in the continents array
			country_per_continent[a] = country_parent;

		}

		// place the array of countries as children under the corresponding continent
		continent_parent["children"] = country_per_continent;
		continent_parent.name = continents[i];

		// place all continent objects in an array
		continents_total[i] = continent_parent;

	}

	// place the array of continents as children in the world data
	sunburst_data["children"] = continents_total;
	sunburst_data.name = "World";

	//console.log(sunburst_data);
	return sunburst_data;

}

// load data
d3.json("data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;
	// set default values
	var industry = "totalCO2";
	var year = 1992;

	Linechart_Data(data, "RUS", "Asia");

	//console.log(data);

	// draw Map with default year 1992
	Draw_Map(1992, data, industry);

// script which creates sunburst
var width = 960,
		height = 700,
		radius = Math.min(width, height) / 2 - 20;

var x = d3.scale.linear()
	.range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
	.range([0, radius]);

var color = d3.scale.category20c();

var svg = d3.select("#sunburst").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ") rotate(-90 0 0)");

var partition = d3.layout.partition()
		.sort(null)
		.value(function(d) {return d.size; });

var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

function computeTextRotation(d) {
    var angle = x(d.x + d.dx / 2) - Math.PI / 2;
    return angle / Math.PI * 180;
}

		// interpolate the scales
		function arcTween(d) {
		    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		        yd = d3.interpolate(y.domain(), [d.y, 1]),
		        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
		    return function(d, i) {
		        return i ? function(t) {
		            return arc(d);
		        } : function(t) {
		            x.domain(xd(t));
		            y.domain(yd(t)).range(yr(t));
		            return arc(d);
		        };
		    };
		}

		function arcTweenUpdate(a) {
		    console.log(path);
		    var _self = this;
		    var i = d3.interpolate({ x: this.x0, dx: this.dx0 }, a);
		    return function(t) {
		        var b = i(t);
		        console.log(window);
		        _self.x0 = b.x;
		        _self.dx0 = b.dx;
		        return arc(b);
		    };
		}

// function to update the sunburst
var updateChart = function (items) {
    var root = items;
    // DATA JOIN - Join new data with old elements, if any.
    var gs = svg.selectAll("g").data(partition.nodes(root));

    // ENTER
    var g = gs.enter().append("g").on("click", click);

    // UPDATE
   var path = g.append("path")
	 	// add ID's to countries so we can call them later
	 	.attr("id", function(d) {
			// only add country code to country and not it's children
			if ("children" in d){
				return d.ccode;
			}
		});

		//console.log(path);


 gs.select('path')
  .style("fill", function(d) {
      return color((d.children ? d : d.parent).name);
  })
  //.on("click", click)
  .each(function(d) {
      this.x0 = d.x;
      this.dx0 = d.dx;
  })
  .transition().duration(500)
  .attr("d", arc);


  var text = g.append("text");


  /*gs.select('text')
  .attr("x", function(d) {
      return y(d.y);
  })
  .attr("dx", "6") // margin
  .attr("dy", ".35em") // vertical-align
  .attr("transform", function(d) {
      return "rotate(" + computeTextRotation(d) + ")";
  })
  .text(function(d) {
      return d.name;
  })
  .style("fill", "white");*/


  function click(d) {
      console.log(d);
      // fade out all text elements
      if (d.size !== undefined) {
          d.size += 100;
      };
      text.transition().attr("opacity", 0);

      path.transition()
          .duration(750)
          .attrTween("d", arcTween(d))
          .each("end", function(e, i) {
              // check if the animated element's data e lies within the visible angle span given in d
              if (e.x >= d.x && e.x < (d.x + d.dx)) {
                  // get a selection of the associated text element
                  var arcText = d3.select(this.parentNode).select("text");
                  // fade in the text element and recalculate positions
                  arcText.transition().duration(750)
                      .attr("opacity", 1)
                      .attr("transform", function() {
                          return "rotate(" + computeTextRotation(e) + ")"
                      })
                      .attr("x", function(d) {
                          return y(d.y);
                      });
              }
          });
  } //});


  // EXIT - Remove old elements as needed.
  gs.exit().transition().duration(500).style("fill-opacity", 1e-6).remove();

	// when user clicks on coutnry in choropleth, sunburst updates to that country
	var datamap = d3.select('#map > svg > g');
	datamap.selectAll('.datamaps-subunit').on('click', function(geography) {
			// on click select the corresponding country in the sunburst and update sunburst to that country
			var country_link = d3.select('#' + geography.id)["0"]["0"].__data__;
			var continent_link = country_link.parent.name;
			var country_name = country_link.name;
			console.log("country_name:" + country_name);
			console.log("continent_link:" + continent_link);
			click(country_link);
		});

	var test = d3.select('#map > svg > g').selectAll('.datamaps-subunit')["0"];

	/*for (z = 0; z < 177; z++){
		console.log(test[z].__data__.id);
	}*/

}

// update chart to default year
updateChart(Sunburst_Data(year, data));

// call d3 slider and update map and sunburst when slider is adjusted by user
d3.select('#slider').call(d3.slider().axis(true).min(1992).max(2012).step(1)
	// on new year adjust world map and sunburst
	.on("slide", function(evt, value){
		//console.log(typeof (value));

		d3.select('#slidertext').text(value);
		//console.log(test);

		console.log(d3.event);
		//console.log(z.invert(d3.event.x));
		year = value;
		map.updateChoropleth(Worldmap_Data(year, data, industry));

		// console.log(d3.select('#slider'));
		// console.log(slider.value);

		//updateChart(Sunburst_Data(year, data));


	}));


	// select chosen industry and update map with that industry
	d3.selectAll("input[name='industry']").on("change", function() {
			// update choropleth with last known year and new industry
			industry = this.value;

			// update choropleth with new industry
			map.updateChoropleth(Worldmap_Data(year, data, industry));
	});



});
