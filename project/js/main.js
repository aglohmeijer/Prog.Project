// Student: Anne Lohmeijer
// UvA-ID: 10447555
// File: main.js

// load general json data
d3.json("data/CO2_emission.json", function(error, json) {
	if (error) return console.warn(error);
	data = json;

	// set default values to draw first visualizations with
	var industry = "totalCO2";
	var year = 2012;
	var default_country_path = Country_Path('NLD');
	var sea_data = Sealevel_Data();

	// draw all visualizations with default year, country, and industry
	Draw_Map(year, data, industry);
	Draw_Sunburst(year, data, default_country_path.continent, sea_data);
	Draw_Slider(year, sea_data);
	Update_Legend(default_country_path.continent);
	Draw_Linechart(data, default_country_path, sea_data);

	// message under world map info button
	d3.select('#map_button').on('click', function() {
		swal({
			title: "Information about the worldmap",
			width: 1000,
			type: 'info',
			html: "The worldmap shows the emission per country for the industry of your choice for the year you choose on the slider in the middle of the page." + "The unit in which the emission is given is Metric tonnes CO₂. A Metric tonne is equivalent to 1,000 kilograms. You can choose the following industries: </br>" + "<ul><li><b>Electric and Heat</b>: CO₂ emission due to the production of electricity;</li>" + "<li><b>Manufacturing</b>: all emission produced by factories; </li>" + "<li><b>Transportation</b>: all CO₂ emitted by cars, trains and other forms of transport; </li>" + "<li><b>Fuel Combustion</b>: the emission produced when burning fossil fuels such as oil; </li>" + "<li><b>Fugitive</b>	: fugitive emission is a very small part of the total emission which can be translated as loss emission; </li></ul>" + "When you click on a country the other visualizations change to the country of your choice.",
			confirmButtonText: "OK"
		});
	});

	// message under sunburst info button
	d3.select('#sunburst_button').on('click', function() {
		swal({
			title: "How to use the sunburst",
			width: 800,
			type: 'info',
			html: "The Sunburst visualization displays the four major emission industries per country." + "When you move your mouse over the sunburst the country or continent is displayed." + "By clicking on a country or continent the Sunburst adjusts to your choice. In the top of the screen you can choose the continent you want to visualize." + "If you click on the circle in the middle you return to a higher level.",
			confirmButtonText: "OK, got it!"
		});
	});

	// when user clicks on country update linechart and sunburst or give error
	d3.select('#map > svg.datamap > g').selectAll('.datamaps-subunit').on('click', function(geography) {

		// retrieve some usefull data from the clicked country
		var country_path = Country_Path(geography.id);

		// read current year and parse as int
		var curr_year = parseInt(d3.select('#slider > svg > g > g.slider > circle')["0"]["0"].attributes[4].value);

		// if no data available for the clicked country give user notice
		if (isEmpty(country_path)) {
			swal({
				title: "Oops!",
				text: "Unfortunately we have no data available for this country",
				type: "error",
				confirmButtonText: "OK"
			});
		}

		// if the total emission for the clicked country in the current year is zero do not update sunburst and linechart
		else if (data[curr_year][country_path.continent_num][country_path.continent][country_path.country_num].totalCO2 == 0) {
			swal({
				title: "Oops!",
				text: "For " + curr_year + " the total emission in " + country_path.name + " is unknown or zero, unfortunately we cannot update the Sunburst and Linechart for you",
				type: "error",
				confirmButtonText: "OK, I'll try another one"
			});
		}

		// if total CO2 is nonzero for the clicked country in that year update sunburst and linechart
		else {

			// check which continent is currently displayed by the sunburst
			var curr_continent = d3.select("input[name='continent']:checked").node().value;
			var new_continent = country_path.continent;

			// check if clicked country is in continent which is currently displayed by sunburst
			if (new_continent == curr_continent) {

				// update linechart
				Update_Linechart(data, country_path, sea_data);

				// this is a very brute way of updating but else I cannot make it work
				d3.select('#sunburst > svg:nth-child(4)').remove();
				Draw_Sunburst(curr_year, data, curr_continent, sea_data);

				// zoom in on clicked country
				var country_object = d3.select('#' + geography.id)["0"]["0"].__data__;
				Draw_Sunburst.click(country_object);
			}

			// if sunburst displays different continent first update sunburst
			else {

				//update linechart
				Update_Linechart(data, country_path, sea_data);

				// for some reason you can only (un)check radio button with document (not d3)
				document.getElementById(new_continent).checked = true;

				// this is a very brute way of updating but else I cannot make it work
				d3.select('#sunburst > svg:nth-child(4)').remove();
				Draw_Sunburst(curr_year, data, new_continent, sea_data);

				// zoom in on clicked country
				var country_object = d3.select('#' + geography.id)["0"]["0"].__data__;
				Draw_Sunburst.click(country_object);
			}

			//upate legend with new name
			Update_Legend(geography.id);
		}
	});

	//  on industry change update chloropleth
	d3.selectAll("input[name='industry']").on("change", function() {

		// update choropleth with last known year and new industry
		var curr_year = d3.select('#slider > svg > g > g.slider > circle')["0"]["0"].attributes[4].value;
		industry = this.value;
		map.updateChoropleth(Worldmap_Data(curr_year, data, industry));
	});

	// on continent change update sunburst
	d3.selectAll("input[name='continent']").on("change", function() {

		// select current year from slider and update sunburst with last known year and new continent
		var curr_year = d3.select('#slider > svg > g > g.slider > circle')["0"]["0"].attributes[4].value;
		d3.select('#sunburst > svg:nth-child(4)').remove();
		new_continent = this.value;
		Draw_Sunburst(curr_year, data, new_continent, sea_data);

		//update sunburst legenda
		Update_Legend(new_continent);
	});
});
