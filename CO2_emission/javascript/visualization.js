// fist load external json data and draw first map with default year 1992.
var data; // a global
d3.json("/CO2_emission/data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;

	// draw Map with default year 1992
	DrawMap(1992, data);

	DrawSunburst(2012, data);


	// Compare sunburst data with own data
	d3.json("CO2_emission/data/CO2_emission.json", function(error, root) {
		if (error) return console.warn(error);
		console.log(root);

	});




});

// function to draw the actual map
function DrawMap(year, data){

		// create map
		map = new Datamap({
			element: document.getElementById("map"),
			projection: 'mercator',

			// create 7 different colors for different levels:
			fills:	{
					level1:	"#edf8e9",
					level2:	"#c7e9c0",
					level3:	"#a1d99b",
					level4:	"#74c476",
					level5:	"#41ab5d",
					level6:	"#238b45",
					level7:	"#005a32",
					unknown: "white",
					defaultFill: "white",
			},

			// retrieve correct data from json
			data: retrieve_data(year, data),

			// create pop up template
			geographyConfig: {
					popupTemplate: function(geo, data) {
							return ['<div class="hoverinfo"><strong>' + data.name,
											'</strong><br/>Total CO2 emission: ' + data.totalCO2 + ' MtCO2',
											'</div>'].join('');
					},
					popupOnHover: true,
	        highlightOnHover: true,
	        highlightFillColor: 'darkblue',
	        highlightBorderColor: 'white',
	        highlightBorderWidth: 1,
	        highlightBorderOpacity: 1}

		});

};

// this function returns the year chosen by the user on the time bar. Default: 1992.
function showValue(year){
	document.getElementById("range").innerHTML = year;

	// update choropleth with new data corresponding to new year when user adjusts timebar
	map.updateChoropleth(retrieve_data(year, data));

};

// separate function to load the correct data from the json if user has given a year
function retrieve_data(year, data) {

	// because the JSON has two keys you have to retrieve the data via year (1st key) and then via continent (2nd key)
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

	//create new object to store data in
	var data_per_year = new Object;

	// loop through all the six continents which are in one year of data
	for (i = 0; i < 6; i++){

		// store data from one year per country in new object
		data[year][i][continents[i]].forEach(function(d){

			// determine fillkeys for totalCO2 per country (TO DO: create better color combinations and do better scaling of TOTALCO2)
			if (d.totalCO2 < 250) {fillkey = "level1";}
			else if (d.totalCO2 < 500) {fillkey = "level2";}
			else if (d.totalCO2 < 1000) {fillkey = "level3";}
			else if (d.totalCO2 < 2000) {fillkey = "level4";}
			else if (d.totalCO2 < 3000) {fillkey = "level5";}
			else if (d.totalCO2 < 4000) {fillkey = "level6";}
			else {fillkey = "level7";};

			// save data per country in new json format
			data_per_year[d.ccode] = {
				name : d.name,
				continent: continents[i],
				fillKey: fillkey,
				totalCO2: d.totalCO2
			};

		});

	};

	// return data per year to function which draws the map
	return data_per_year;

};



function Sunburst_Data(year, data){

	// because the JSON has two keys you have to retrieve the data via year (1st key) and then via continent (2nd key)
	var continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

	//store new data in object which is appropriate for sunburst
	var sunburst_data = new Object;

	// loop through all the six continents which are in one year of data
	for (i = 0; i < 6; i++){

		// store data from one year per country in new object
		data[year][i][continents[i]].forEach(function(d){
			sunburst_data[d.name] = {
				"name": "Total CO2",
				"size": d.totalCO2};
			})



		};



	//sunburst_data = data[year]["2"].Europe;




// console.log(sunburst_data);
return sunburst_data;

}






// function to draw sunburst
function DrawSunburst(year, data){

// check (works)
// console.log(data[1992]["0"].Africa[6].totalCO2);

// console.log(retrieve_data(2002, data));

Sunburst_Data(year, data);

/*

// script which creates sunburst
var width = 960,
		height = 700,
		radius = Math.min(width, height) / 2;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
	.range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
	.range([0, radius]);

var color = d3.scale.category20c();

var partition = d3.layout.partition()
		.value(function(d) {return d.totalCO2;});

var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.x)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

var svg = d3.select("#sunburst").append("svg")
		.attr("width", width)
		.attr("height", height)
	.append("g")
		.attr("transform", "translate(" + width / 2 + "," + (height / 2) + " )");

svg.selectAll("path")
		.data(partition.nodes(Sunburst_Data(year, data)));


		/*
	.enter().append("path")
		.attr("d", arc)
		.style("fill", function(d) { return color((d.
		.on("click", click)
	.append("title")
		.text(function(d) { return d.name + "\n" + formatNumber(d.totalCO2); });
*/

}
