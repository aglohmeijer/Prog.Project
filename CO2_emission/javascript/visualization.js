// fist load external json file
var data; // a global
d3.json("/CO2_emission/data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;

	// create map
	var chloropleth = new Datamap({
		element: document.getElementById("map"),
		projection: 'mercator',

		// create 5 different colors for different levels:
		fills:	{
				level5: "#eff3ff",
				level4: "#bdd7e7",
				level3: "#6baed6",
				level2: "#3182bd",
				level1: "#08519c",
				unknown: "white",
				defaultFill: "#87CEFA",
		},

		// retrieve correct data from json
		data: retrieve_data(2010, data)

	});

})



// this function returns the year chosen by the user on the time bar. Default: 1992.
function showValue(year){
	document.getElementById("range").innerHTML = year;
	/*chloropleth.updateChloropleth({
		retrieve_data(year, data)

	});*/

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
			if (d.totalCO2 < 500) {fillkey = "level1";}
			else if (d.totalCO2 < 1000) {fillkey = "level2";}
			else if (d.totalCO2 < 2000) {fillkey = "level3";}
			else if (d.totalCO2 < 3000) {fillkey = "level4";}
			else {fillkey = "level5";};

			// save data per country in new json format
			data_per_year[d.ccode] = {
				name : d.name,
				fillKey: fillkey,
				totalCO2: d.totalCO2
			};

		});

	};

	// return data per year to function which draws the map
	return data_per_year;

};
