// gloabl data variable
var data;

// draw choropleth
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

// load data in correct format for linechart
function Linechart_Data(data, country_link){

	// define some variables needed to retrieve the correct data
	var continent_link = country_link.parent.name,
			country_code = country_link.ccode,
			country_num = country_link.parent.children.map(function(x) {return x.ccode; }).indexOf(country_code),
			continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"],
			continent_num = continents.indexOf(continent_link);

	var linechart_data = new Object;
	linechart_data.values = [];

	// loop through every year per country
	for (year = 1992; year < 2013; year++){

		linechart_data.ccode = data[year][continent_num][continent_link][country_num].ccode;

		// write data in appropriate format
		[data[year][continent_num][continent_link][country_num]].forEach(function(d){
			linechart_data.values.push({
				"year" : year,
				"totalCO2" : d.totalCO2,
				"electricandheat" : d.electricandheat,
				"manufacturing" : d.manufacturing,
				"transportation" : d.transportation,
				"fuelcombustion" : d.fuelcombustion,
				"fugitive" : d.fugitive
			});
		});
	}

	// return appropriate data
	return linechart_data;
}

// draw line chart
function Draw_Linechart(data, country_link){

	var margin = {top: 20, right: 80, bottom: 30, left: 50},
			width = 900 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;

	// functions to parse dates and values correctly
	var parseDate = d3.time.format("%Y").parse;
	//var formatValue = d3.format(",.2f");

	var x = d3.scale.linear().range([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickFormat(d3.format("d"));

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var line = d3.svg.line()
			.interpolate('basis')
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.values); });

	var svg = d3.select("#linechart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	//line_data = Linechart_Data(data, 1, 'Asia', 31);
	line_data = Linechart_Data(data, country_link);

	//line_data = Linechart_Data(data, country_link));
	//console.log(line_data);

	// set x domain
	x.domain(d3.extent(line_data.values, function(d) {return d.year;}));

	// set y domain
	y.domain([d3.min(line_data.values, function(d) {return Math.min(d.totalCO2, d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive);
			}),
			d3.max(line_data.values, function(d) {return Math.max(d.totalCO2, d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive);})]);

	// make the x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// make the y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("MtCO2");


	// Define variable for the plot
 	var plot = svg.selectAll(".plot")
 		.data([line_data])
 		.enter().append("g")
 		.attr("class", "line_graph");


	var industry = ['totalCO2', 'electricandheat', 'manufacturing', 'transportation', 'fuelcombustion', 'fugitive'];

	// draw all lines seperately
	for (m = 0; m < industry.length; m++){

		line.y(function(d) {
			return y(d[industry[m]]);
		});

		plot.append("path")
			.attr("class", "line")
			.attr("d", function(d) {return line(d.values);});
	}

}

// function to update linechart when user clicks on new country
function Update_Linechart(data, country_link){
	d3.select("#linechart > svg").remove();
	Draw_Linechart(data, country_link);
}

// load data in correct format for choropleth
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

// load data in correct format for sunburst
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

// draw sunburst
function Draw_Sunburst(year, data){

	// script which creates sunburst
	var width = 600,
			height = 600,
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
						// console.log(arc);
							return arc(d);
					} : function(t) {
							x.domain(xd(t));
							y.domain(yd(t)).range(yr(t));
							//console.log(arc);
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

	// update sunburst
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
				if ("ccode" in d){
					//console.log(d.ccode);
					return d.ccode;
				}
			});


	 gs.select('path')
		.style("fill", function(d) {
				//console.log(color((d.children ? d : d.parent).name));
				return color((d.children ? d : d.parent).name);

				// TODO color implementation for sunburst


		})
		//.on("click", click)
		.each(function(d) {
				this.x0 = d.x;
				this.dx0 = d.dx;
		})
		// if you give duration a value between 0 and 1 it will give error
		.transition().duration(1)
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

		// update sunburst on click
		function click(d) {
				//console.log(d);
				// fade out all text elements
				if (d.size !== undefined) {
						d.size += 100;
				};
				text.transition().attr("opacity", 0);
				// console.log("TEST"
				path.transition()
						.duration(1000)
						.attrTween("d", arcTween(d))
						// .each("end", function(e, i) {
						//     // check if the animated element's data e lies within the visible angle span given in d
						//     if (e.x >= d.x && e.x < (d.x + d.dx)) {
						//         // get a selection of the associated text element
						//         var arcText = d3.select(this.parentNode).select("text");
						//         // fade in the text element and recalculate positions
						//         arcText.transition().duration(750)
						//             .attr("opacity", 1)
						//             .attr("transform", function() {
						//                 return "rotate(" + computeTextRotation(e) + ")"
						//             })
						//             .attr("x", function(d) {
						//                 return y(d.y);
						//             });
						//     }
						// })
						;
		} //});

		updateChart.click = click;


		// EXIT - Remove old elements as needed.
		gs.exit().transition().duration(500).style("fill-opacity", 1e-6).remove();

	}

	// update chart to default year
	updateChart(Sunburst_Data(year, data));

	// in this way updateChart can be called from outside this function
	Draw_Sunburst.updateChart = updateChart;
	Draw_Sunburst.click = updateChart.click;
}

// draw slider
function Draw_Slider(){
	var margin = {top: 20, right: 20, bottom: 20, left: 20},
			width = 800 - margin.left - margin.right,
			height = 80 - margin.bottom - margin.top;

	var x2 = d3.scale.linear()
			.domain([1992, 2012])
			.range([0, width])
			.clamp(true);

	var brush = d3.svg.brush()
			.x(x2)
			.extent([0, 0])
			.on("brush", brushed)
			.on("brushend", brushend);


	var svg2 = d3.select("#slider").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg2.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height / 2 + ")")
			.call(d3.svg.axis()
				.scale(x2)
				.orient("bottom")
				.tickValues(d3.range(1992, 2012, 2))
				.tickFormat(function(d) { return d; })
				.tickSize(0)
				.tickPadding(12))
		.select(".domain")
		.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "halo");

	var slider = svg2.append("g")
			.attr("class", "slider")
			.call(brush);

	slider.selectAll(".extent,.resize")
			.remove();

	slider.select(".background")
			.attr("height", height);

	var handle = slider.append("circle")
			.attr("class", "handle")
			.attr("transform", "translate(0," + height / 2 + ")")
			.attr("r", 9);
			//.attr("cx", x2.invert(2012));

	slider
			.call(brush.event)
		.transition() // gratuitous intro!
			.duration(0)
			.call(brush.extent([70, 70]))
			.call(brush.event);

	function brushed() {
		var value = brush.extent()[0];
		//console.log(value);
		if (d3.event.sourceEvent) { // not a programmatic event
			value = x2.invert(d3.mouse(this)[0]);
			brush.extent([value, value]);
		}

		handle.attr("cx", x2(value));
	}

	function brushend() {
		 if (!d3.event.sourceEvent) {
			 return; // only transition after input
		 }

		 var value = brush.extent()[0];
		 brush.extent([value, value]);

		 d3.select(this)
			 .transition()
			 .duration(0)
			 .call(brush.event);

		 d3.select(this)
			 .transition()
			 // on user input at timebar update choropleth and sunburst
			 .call(brush.extent(brush.extent().map(function(d) {
				 var year = d3.round(d);

				 // select industry which is currently checked
				 var industry = d3.select("input[name='industry']:checked").node().value;

				 // update choropleth
				 map.updateChoropleth(Worldmap_Data(year, data, industry));

				 // update sunburst
				 Draw_Sunburst.updateChart(Sunburst_Data(year, data));

				 return year; })))
			 .call(brush.event);

			// this turned out to be unneccessary
			// var year = d3.select(this)["0"]["0"].__chart__.i[1];
			// updateChart(Sunburst_Data(year, data));
	 }
 }

// load general json data
d3.json("data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;

	// set default values
	var industry = "totalCO2";
	var year = 2012;

	// draw Map with default year 1992
	Draw_Map(year, data, industry);
	Draw_Sunburst(year, data);
	Draw_Slider();

	// draw first linegraph with default country germany (only possible AFTER Draw_Sunburst!)
	var germany = d3.select('#DEU')["0"]["0"].__data__;
	Draw_Linechart(data, germany);

	 // when user clicks on country update linechart and sunburst
 	d3.select('#map > svg > g').selectAll('.datamaps-subunit').on('click', function(geography) {

 			/* when a country is clicked, the corresponding object in the sunburst is selected,
			because that Object contains usefull information (parent, child etc.) for the linechart_data function*/

			// select country object
 			var country_link = d3.select('#' + geography.id)["0"]["0"].__data__;

			// update linechart and sunburst
			Update_Linechart(data, country_link);
 			Draw_Sunburst.click(country_link);
 		});

	// select chosen industry and update choropleth with that industry
	d3.selectAll("input[name='industry']").on("change", function() {

			// update choropleth with last known year and new industry
			industry = this.value;
			map.updateChoropleth(Worldmap_Data(year, data, industry));
	});

});
