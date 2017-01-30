// draw choropleth
function Draw_Map(year, data, industry){

		// small object to translate names in hover
		var industry_name = new Object;
		industry_name = {'totalCO2' : 'all industries', 'electricandheat' : 'electric and heat', 'manufacturing' : 'Manufacturing', 'transportation' : 'transporation', 'fuelcombustion' : 'fuel combustion', 'fugitive' : 'Fugitive'};

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
											'</strong><br/>Emission in ' + year + ' due to ' + industry_name[d3.select("input[name='industry']:checked").node().value] + ':<br/><strong> ' + data.value + ' MtCO<sub>2</sub></strong>',
											'</div>'].join('');
					},
					popupOnHover: true,
	        highlightOnHover: true,
	        highlightFillColor: 'grey',
	        highlightBorderColor: 'white',
	        highlightBorderWidth: 1,
	        highlightBorderOpacity: 1}

		});

}

// load data in correct format for linechart
function Linechart_Data(data, country_path){

	// define some variables needed to retrieve the correct data
	var continent_name = country_path.continent,
			country_code = country_path.country_code,
			country_num = country_path.country_num,
			continent_num = country_path.continent_num;

	var linechart_data = new Object;
	linechart_data.values = [];

	// loop through every year per country
	for (year = 1992; year < 2013; year++){

		linechart_data.ccode = country_path.country_code;

		// write data in appropriate format
		[data[year][continent_num][continent_name][country_num]].forEach(function(d){
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
			width = 1000 - margin.left - margin.right,
			height = 350 - margin.top - margin.bottom;

	// functions to parse dates and values correctly
	var parseDate = d3.time.format("%Y").parse;
	//var formatValue = d3.format(",.2f");

	var x = d3.scale.linear().range([0, width]);

	var y = d3.scale.linear().range([height, 0]);
	var y2 = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickFormat(d3.format("d"));

	var yAxisLeft = d3.svg.axis()
		.scale(y)
		.orient("left").ticks(6);

	var yAxisRight = d3.svg.axis()
		.scale(y2)
		.orient("right").ticks(6);

	var line = d3.svg.line()
			.interpolate('basis')
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y(d.values); });

	var line_2 = d3.svg.line()
			.x(function(d) { return x(d.year); })
			.y(function(d) { return y2(d.level); });

	var svg = d3.select("#linechart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	//load emission data
	line_data = Linechart_Data(data, country_link);
	// console.log(line_data);

	// load sealevel data
	sea_data = Sealevel_Data();
	// console.log(sea_data);

	// set x domain
	x.domain(d3.extent(line_data.values, function(d) { return d.year;}));

	// set y domain for emission
	y.domain([d3.min(line_data.values, function(d) { return Math.min(d.totalCO2, d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive);
			}),
			d3.max(line_data.values, function(d) { return Math.max(d.totalCO2, d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive);})]);

	// set y domain for sealevel
	y2.domain([d3.min(sea_data, function(d) { return Math.min(d.level); }), d3.max(sea_data, function(d) { return Math.max(d.level); })]);

	// make the x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// draw left y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxisLeft)
	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("MtCO2");

	// draw right y axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + width + ",0)")
		.call(yAxisRight)
	.append("text")
		.attr("y", 6)
		.attr("dy", ".71em")
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "end")
		.text("Sea-level rise");

	// Define variable for the plot
 	var plot = svg.selectAll(".plot")
 		.data([line_data])
 		.enter().append("g")
 		.attr("class", "line_graph");

	var plot_2 = svg.selectAll(".plot_2")
		.data([sea_data])
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

	plot_2.append("path")
		.attr("class", "line")
		.attr("d", function (d) {return line_2(d);});

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

	// array to put all values in to determine min and max (for all years, else the legend changes over time)
	var all_values = [];

	for (Year = 2012; Year < 2013; Year++){

		// loop through all continents
		for (i = 0; i < 6; i++){

			// loop through all items per continent
			data[Year][i][continents[i]].forEach(function(d){

				// push all values
				all_values.push(d[industry]);
			});

		};

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

	Worldmap_Data.industry_color = industry_color;
	Worldmap_Data.color_range = color_range;
	Worldmap_Data.paletteScale = paletteScale;

	// now save data per country and assign color
	for (j = 0; j < 6; j++){

		// store data from one year per country in new object
		data[year][j][continents[j]].forEach(function(d){

			// some countries contain empty fields which actually equals 0 emission, unknown is lightgrey
			var fillcolor;
			 if (isEmpty(d[industry])){
				fillcolor = paletteScale(parseFloat(0));}
			else { fillcolor = paletteScale(parseFloat(d[industry]));}

			// save data per country in new json format
			data_per_year[d.ccode] = {
				name : d.name,
				fillColor: fillcolor,
				industry: industry,
				value: d[industry]
			};
		});
	};

	// draw legend (d3 function from additional library)
	var svg = d3.select("#legend");

	svg.append("g")
	  .attr("class", "legendLinear")
	  .attr("transform", "translate(20,20)");

	var legendLinear = d3.legend.color()
	  .shapeWidth(50)
		.title('Metric Tonnes CO')
	  .cells(7)
	  .orient('vertical')
		.labelFormat(function(d) {
			if (d == 0){ return 0;}
			else{ return d3.format(".2s")(d);}
		})
	  .scale(paletteScale);

	svg.select(".legendLinear")
	  .call(legendLinear);

	// return data
	return data_per_year;
}

// load data in correct format for sunburst
function Sunburst_Data(year, data, continent){

	// create object in which I place formatted data
	var sunburst_data = new Object;

	// create two arrays which makes accessing JSON data easier
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];
	var industries = ["electricandheat", "manufacturing", "transportation", "fuelcombustion", "fugitive", "totalCO2"];

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

			// START don't take 6 (totalco2) because it doesn't make sense to put the totalCO2 in the sunburst!
			// loop through the numbers per country
			for (z = 0; z < 4; z ++){

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

	// only return data for one continent
	continent_num = continents.indexOf(continent);
	return sunburst_data.children[continent_num];

}

// draw sunburst
function Draw_Sunburst(year, data, continent){

	// script which creates sunburst
	var width = 600,
			height = 600,
			radius = Math.min(width, height) / 2 - 50;

	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);

	var y = d3.scale.pow().exponent(1.2)
		.range([0, radius]);


	// TODO: add different color scales per continent
	var color = d3.scale.category20c();

	var industry_color = new Object;
	industry_color = {'electricandheat' : '#d7191c', 'manufacturing': '#ffffbf', 'transportation' : '#abd9e9', 'fuelcombustion' : '#2c7bb6'};

	// console.log(industry_color);
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
			var g = gs.enter().append("g").on("click",click);

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
				//console.log(d);

				// return color()
				// return color((d.children ? d : d.parent).name);

				// TODO color implementation for sunburst
				//console.log(d);
				// hier staat eigenlijk
				// console.log(d);
				if (d.children)
				// { console.log(d.name);
					{return industry_color[d.name];}
				else {
					return industry_color[d.name];
				}

		})
		//.on("click", click)
		.each(function(d) {
				this.x0 = d.x;
				this.dx0 = d.dx;
		})
		// if you give duration a value between 0 and 1 it will give error
		.transition().duration(0)
		.attr("d", arc);

		// draw sunburst legenda
		function Sunburst_Legend(items){

			var legend_data = items.children["0"].children;
			var industry_leafs = [];
			legend_data.forEach(function(d){
				industry_leafs.push(d.name);
			})

			// first remove current legenda
			d3.select('#legend_sunburst > g').remove();

			// draw new legenda with new colors
			var svg = d3.select('#legend_sunburst');

			svg.append('g')
				.attr('class', 'sunburst_legend')
				.attr('transform', 'translate(20,20)');

			// this line is somewhat hardcoded since I used the d3.legend as reference
			var gs = svg.selectAll('g').data(industry_leafs).append('g').attr('class', 'legend_cells').attr('transform', 'translate(0, 27)');

			// add colored circles to legenda
			gs.selectAll('g').data(industry_leafs).enter().append("g")
					.attr('class', 'cell')
					.attr("transform", function(d, i){
						// console.log(i);
						// console.log(d);
						var y = i * 27;
						var x = 5;
						return 'translate(' + x + ',' + y + ')';
					})
					.append('circle')
						.attr('r', 12)
						.style('fill', function(d){ return industry_color[d];})

				var industry_name = new Object;
				industry_name = {'totalCO2' : 'Total Emission', 'electricandheat' : 'Electric and Heat', 'manufacturing' : 'Manufacturing', 'transportation' : 'Transporation', 'fuelcombustion' : 'Fuel Combustion', 'fugitive' : 'Fugitive'};

				// add text
				gs.selectAll('g').append('text')
					.attr('class', 'label')
					.attr('transform', 'translate(20, 6)')
					.text(function(d){ return industry_name[d];});
		}

		Sunburst_Legend(items);

		var text = g.append("text");
		//
		// gs.select('text')
		// .attr("x", function(d) {
		// 		return y(d.y);
		// })
		// .attr("dx", "6") // margin
		// .attr("dy", ".35em") // vertical-align
		// .attr("transform", function(d) {
		// 		return "rotate(" + computeTextRotation(d) + ")";
		// })
		// .text(function(d) {
		// 		return d.name;
		// })
		// .style("fill", "white");

		// update sunburst on click
		function click(d) {

				// update legend to clicked continent or country
				Update_Legend(d.ccode ? d.ccode : d.name);

				// console.log(d);
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

	var sunburst_data = Sunburst_Data(year, data, continent);
	// console.log(sunburst_data);

	// update chart to default year
	updateChart(sunburst_data);

	// in this way updateChart can be called from outside this function
	Draw_Sunburst.updateChart = updateChart;
	Draw_Sunburst.click = updateChart.click;


}

// function to load sealevel_data (small array so not necessary to import from external file)
function Sealevel_Data() {

	// load json data via query else I can only use it inside the d3.json function
	var jsonData;
	$.ajax({
  	dataType: "json",
  	url: "data/sealevel_data.json",
  	async: false,
  	success: function(data){jsonData = data}
	});
	// return array
	return jsonData;
}

// this function updates the sunburst legenda to the current continent/country
function Update_Legend(new_country){

	// first remove current country
	d3.select('#legend_sunburst > text').remove();

	// define title object
	var title = d3.select('#legend_sunburst').append('text').attr('class', 'legendTitle').attr('transform', 'translate(20, 20)');

	// if the sunburst focusses on one country use coutnry ID, else append continent name to legend
	if (new_country.length == 3){

			title.text((Country_Path(new_country)).name);
	}
	else {
		title.text(new_country);
	}
}

// draw slider
function Draw_Slider(year){
	var margin = {top: 20, right: 20, bottom: 20, left: 20},
			width = 1710 - margin.left - margin.right,
			height = 100 - margin.bottom - margin.top;

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
				.tickValues(d3.range(1992, 2013, 1))
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


	// this is the slider event which is displayed when (re)loading
	slider.call(brush.event)
		.transition()
			.duration(2000)
			.call(brush.extent([year, year]))
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

	function hue(h) {
  handle.attr("cx", x(h));
  	svg.style("background-color", d3.hsl(h, 0.8, 0.8));
	}

	// #slider > svg > g > g.slider > circle

	function brushend() {
		 if (!d3.event.sourceEvent) {
			 return; // only transition after input
		 }

		 var value = brush.extent()[0];
		 brush.extent([value, value]);

		 d3.select(this)
			 .transition(0)
			 .duration(500)
			 .call(brush.event);

		 d3.select(this)
			 .transition(0)
			 // on user input at timebar update choropleth and sunburst
			 .call(brush.extent(brush.extent().map(function(d) {
				 var year = d3.round(d);

				 // check which industry and continent are selected
				 var industry = d3.select("input[name='industry']:checked").node().value;
				 var curr_continent = d3.select("input[name='continent']:checked").node().value;

				 // update choropleth
				 map.updateChoropleth(Worldmap_Data(year, data, industry));

				 // update sunburst
				 Draw_Sunburst.updateChart(Sunburst_Data(year, data, curr_continent));

				 return year; })))
			 .call(brush.event);

			// this turned out to be unneccessary
			// var year = d3.select(this)["0"]["0"].__chart__.i[1];
			// updateChart(Sunburst_Data(year, data));
	 }
 }

// function to retrieve indices and keys from a given country in the general data set (very usefull);
function Country_Path(country_code){
 var properties = new Object;
 [data[2012]].forEach(function(d){
	 d.forEach(function(c, i){
		 for (var p in c){
			 [c[p]].forEach(function(e){
				 e.forEach(function(f, j){
					 if (f.ccode === country_code){
						 properties.name = f.name;
						 properties.continent_num = i;
						 properties.continent = p;
						 properties.country_num = j;
						 properties.country_code = country_code;
						 return;}
				 });
			 });
		 };
	 });
 });
 return properties;
}

// small help function which checks if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

// load general json data
d3.json("data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;

	// set default values
	var industry = "totalCO2";
	var year = 2012;
	var default_country = 'DEU';
	var default_continent = 'Europe';

	// draw Map with default year 1992
	Draw_Map(year, data, industry);
	Draw_Sunburst(year, data, default_continent);
	Draw_Slider(year);
	Update_Legend(default_continent);

	// draw first linegraph with default country germany (only possible AFTER Draw_Sunburst!)
	var germany = Country_Path(default_country);
	Draw_Linechart(data, germany);

	 // when user clicks on country update linechart and sunburst
 	d3.select('#map > svg.datamap > g').selectAll('.datamaps-subunit').on('click', function(geography) {

			// retrieve some usefull data from the clicked country
			var country_path = Country_Path(geography.id);
			// console.log(country_path);

			// check which continent is displayed by the sunburst first
			var curr_continent = d3.select("input[name='continent']:checked").node().value;
			var new_continent = country_path.continent;

			// if no data available give user notice
			if(isEmpty(country_path)){
				alert("There is no data available for this country");
			}
			// check if clicked country is in continent which is currently displayed by sunburst
			else if (new_continent == curr_continent)
			{
				// update linechart
				Update_Linechart(data, country_path);

				// this is a very brute way of updating but else I cannot make it work
				d3.select('#sunburst > svg:nth-child(4)').remove();
				Draw_Sunburst(year, data, curr_continent);

				// zoom in on clicked country
				var country_object = d3.select('#' + geography.id)["0"]["0"].__data__;
				Draw_Sunburst.click(country_object);
			}
			// if sunburst displays different continent first update sunburst
			else {
				//update linechart
				Update_Linechart(data, country_path);

				// update sunburst and change radio button
				//Draw_Sunburst.updateChart(Sunburst_Data(year, data, new_continent));

				// for some reason you can only (un)check radio button with document (not d3)
				document.getElementById(new_continent).checked = true;

				// this is a very brute way of updating but else I cannot make it work
				d3.select('#sunburst > svg:nth-child(4)').remove();
				Draw_Sunburst(year, data, new_continent);

				// zoom in on clicked country
				var country_object = d3.select('#' + geography.id)["0"]["0"].__data__;
				Draw_Sunburst.click(country_object);
			}

			//upate legend with new name
			Update_Legend(geography.id);

 		});

	//  on industry change update chloropleth
	d3.selectAll("input[name='industry']").on("change", function() {
			// update choropleth with last known year and new industry
			industry = this.value;
			map.updateChoropleth(Worldmap_Data(year, data, industry));
	});

	// on continent change update sunburst
	d3.selectAll("input[name='continent']").on("change", function(){

		// update sunburst
		d3.select('#sunburst > svg:nth-child(4)').remove();
		new_continent = this.value;
		Draw_Sunburst(year, data, new_continent);

		//update sunburst legenda
		Update_Legend(new_continent);

	});

});
