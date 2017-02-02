// Student: Anne Lohmeijer
// UvA-ID: 10447555
// File: data.js


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
								 	 yellow: ['#ffffcc','#b10026'],
									  black: ['#f7f7f7','#252525'],
						  yellow_blue: ['#ffffd9', '#0c2c84']};

	// asign a different colorscheme to every industry
	var industry_color = {totalCO2: 'yellow_blue',
								 electricandheat: 'blue',
								 	 manufacturing: 'yellow',
								 	transportation: 'red',
							 		fuelcombustion: 'green',
						 						fugitive: 'purple'};

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
	  .attr("transform", "translate(10, 30)");

	var legendLinear = d3.legend.color()
	  .shapeWidth(50)
		.shapeHeight(20)
		.shapePadding(7)
		.title('Mt CO₂')
	  .cells(7)
	  .orient('vertical')
		.labelFormat(function(d) {
			if (d == 0){ return 0;}
			else{ return d3.format(".2s")(d);}
		})
	  .scale(paletteScale);

	svg.select(".legendLinear")
	  .call(legendLinear);

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

// function to load sealevel_data (only called when loading the page)
function Sealevel_Data() {

	// load json data via query else I can only use it inside the d3.json function
	var jsonData;
	$.ajax({
  	dataType: "json",
  	url: "data/sealevel_data.json",
  	async: false,
  	success: function(data){jsonData = data}
	});


	// the data contains nearly 20 entries per year, so filter some (not most efficient function but is only called once)
	var filtered_data = [];

	// I had to hardcode the first year unfortunately (unknown bug)
	var round_year = new Object;
	round_year.year = 1993;
	round_year.level = -13.74;
	filtered_data.push(round_year);

	for (year = 1994; year < 2013; year++){
		for (i = 1; i < jsonData.length; i++){
			var diff = Math.abs(jsonData[i].year - year);
			if (diff < (Math.abs(jsonData[i - 1].year - year))){
				var index = i;
				}
		}

		// create object with data for round year and push into new data array
		var round_year = new Object;
		round_year.year = d3.round(jsonData[index].year);
		round_year.level = jsonData[index].level;
		filtered_data.push(round_year);
	}

	return filtered_data;
}
