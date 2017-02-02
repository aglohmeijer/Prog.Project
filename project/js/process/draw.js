// Student: Anne Lohmeijer
// UvA-ID: 10447555
// File: draw.js
// draw choropleth
function Draw_Map(year, data, industry) {

	// small object to translate names in hover
	var industry_name = new Object;
	industry_name = {
		'totalCO2': 'all industries',
		'electricandheat': 'electric and heat',
		'manufacturing': 'Manufacturing',
		'transportation': 'transporation',
		'fuelcombustion': 'fuel combustion',
		'fugitive': 'Fugitive'
	};

	map = new Datamap({
		element: document.getElementById("map"),
		projection: 'mercator',
		fills: {
			defaultFill: 'lightgrey'
		},

		// retrieve correct data from json
		data: Worldmap_Data(year, data, industry),

		// create pop up template
		geographyConfig: {
			popupTemplate: function(geo, data) {
				return ['<div class="hoverinfo"><strong>' + data.name,
					'</strong><br/>Emission in ' + year + ' due to ' + industry_name[d3.select("input[name='industry']:checked").node().value] + ':<br/><strong> ' + data.value + ' MtCO<sub>2</sub></strong>',
					'</div>'
				].join('');
			},
			popupOnHover: true,
			highlightOnHover: true,
			highlightFillColor: 'grey',
			highlightBorderColor: 'white',
			highlightBorderWidth: 1,
			highlightBorderOpacity: 1
		}

	});

}

// draw line chart
function Draw_Linechart(data, country_link, sea_data) {

	var margin = {
			top: 60,
			right: 400,
			bottom: 30,
			left: 100
		},
		width = 1400 - margin.left - margin.right,
		height = 350 - margin.top - margin.bottom;

	// functions to parse dates and values correctly
	var parseDate = d3.time.format("%Y").parse;

	var x = d3.scale.linear().range([0, width]),
		y = d3.scale.linear().range([height, 0]),
		y2 = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickFormat(d3.format("d"));

	var xAxis_2 = d3.svg.axis()
		.scale(x)
		.orient("top")
		.tickValues([]);

	var yAxisLeft = d3.svg.axis()
		.scale(y)
		.orient("left").ticks(6);

	var yAxisRight = d3.svg.axis()
		.scale(y2)
		.orient("right").ticks(6);

	var line = d3.svg.line()
		.interpolate('basis')
		.x(function(d) {
			return x(d.year);
		})
		.y(function(d) {
			return y(d.values);
		});

	var line_2 = d3.svg.line()
		.interpolate('bundle')
		.x(function(d) {
			return x(d.year);
		})
		.y(function(d) {
			return y2(d.level);
		});

	var svg = d3.select("#linechart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//load emission data (sea-level data is given)
	line_data = Linechart_Data(data, country_link);

	// set x domain
	x.domain(d3.extent(line_data.values, function(d) {
		return d.year;
	}));

	// first determine the max value because the minimum value will be a fraction (negative) of this value
	var max_value = d3.max(line_data.values, function(d) {
			return Math.max(d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive);
		}),
		min_value = max_value * -0.05;

	// set y domain for emission
	y.domain([min_value, max_value]);

	// set y domain for sealevel
	y2.domain([d3.min(sea_data, function(d) {
		return Math.min(d.level);
	}), d3.max(sea_data, function(d) {
		return Math.max(d.level);
	})]);

	// make the x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// make upper x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0, 0)")
		.call(xAxis_2);

	// draw left y axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxisLeft)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "-4em")
		.style("text-anchor", "end")
		.style('font-size', '16px')
		.text("Emission (MtC0₂)");

	// draw right y axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + width + ",0)")
		.call(yAxisRight)
		.append("text")
		.attr("y", 6)
		.attr("dy", "4em")
		.attr("transform", "rotate(-90)")
		.style("text-anchor", "end")
		.style('font-size', '16px')
		.text("Sea-level variation (mm)");

	// define variables for the plot
	var plot = svg.selectAll(".plot")
		.data([line_data])
		.enter().append("g")
		.attr("class", "line_graph");

	var plot_2 = svg.selectAll(".plot_2")
		.data([sea_data])
		.enter().append("g")
		.attr("class", "line_graph_2");

	var industry = ['electricandheat', 'manufacturing', 'transportation', 'fuelcombustion', 'fugitive', 'sealevel'];

	var name_format = new Object,
		name_format = {
			'electricandheat': 'Electric and Heat',
			'manufacturing': 'Manufacturing',
			'transportation': 'Transportation',
			'fuelcombustion': 'Fuel Combustion',
			'fugitive': 'Fugitive',
			'sealevel': 'Sea Level Variation'
		};

	// line colorring which corresponds with the colors in the choropleth and sunburst
	var industry_color = new Object;
	var industry_color = {
		'electricandheat': 'rgb(81, 117, 159)',
		'manufacturing': '#fed976	',
		'transportation': '#d73027',
		'fuelcombustion': 'rgb(79, 143, 111)',
		'fugitive': 'rgb(130, 93, 172)',
		'sealevel': 'black'
	};

	// draw all lines seperately
	for (m = 0; m < (industry.length - 1); m++) {

		line.y(function(d) {
			return y(d[industry[m]]);
		});

		plot.append("path")
			.attr("class", "line")
			.style('stroke', industry_color[industry[m]])
			.attr("d", function(d) {
				return line(d.values);
			});
	}

	// draw sea varation plot
	plot_2.append("path")
		.attr("class", "line")
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.attr("d", function(d) {
			return line_2(d);
		});

	// draw black vertical line
	svg.append("path") // this is the black vertical line to follow mouse
		.attr("class", "mouseLine")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("opacity", "0");

	// append country name as graph title
	svg.append("text")
		.attr("x", (width / 2))
		.attr("y", (-margin.top / 3))
		.attr("text-anchor", "middle")
		.style('font-size', '40px')
		.style('font-weight', 'bold')
		.text(country_link.name);

	// draw legenda with industry names
	var legenda = d3.select('#linechart_legend');

	legenda.append('g')
		.attr('class', 'linechart_legend')
		.attr('transform', 'translate(10,80)');

	var gs = legenda.selectAll('g').data(industry).append('g').attr('class', 'legend_cells');

	gs.selectAll('g').data(industry).enter().append("g")
		.attr('class', 'legend_cells')
		.append('rect')
		.attr('transform', function(d, i) {
			var y = i * 35;
			var x = 5;
			return 'translate(' + x + ',' + y + ')';
		})
		.attr('width', 40)
		.attr('height', 25)
		.style('fill', function(d) {
			return industry_color[d];
		});

	gs.selectAll('g')
		.append('text')
		.attr('class', 'label')
		.attr('transform', function(d, i) {
			var y = i * 35 + 15;
			var x = 60;
			return 'translate(' + x + ',' + y + ')';
		})

	.text(function(d) {
		return name_format[d];
	});

	// mouseover function
	var focus = svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line")
		.attr("y0", -(height / 2))
		.attr("y1", (height))
		.style("stroke-width", 3)
		.style("stroke", "black");

	svg.append("rect")
		.attr("class", "overlay")
		.attr("width", width)
		.attr("height", height)
		.on("mouseover", function() {
			focus.style("display", null);
		})
		.on("mouseout", function() {
			focus.style("display", "none");
			// remove year and corresponding values from legenda too
			d3.select('#linechart_legend > text').remove();
			d3.selectAll('#linechart_legend > g > g > g > text.values').remove();
		})
		.on("mousemove", mousemove);

	function mousemove() {
		var hover_year = parseInt(x.invert(d3.mouse(this)[0]));
		focus.attr("transform", "translate(" + x(hover_year) + "," + 0 + ")");
		focus.select("text").text(hover_year);

		var d = new Object;
		d = line_data.values[hover_year - 1992];
		try {
			d.sealevel = sea_data[hover_year - 1993].level;
		} catch (err) {
			d.sealevel = "Unknown";
		}

		// store values in array to display them later
		var values = [d.electricandheat, d.manufacturing, d.transportation, d.fuelcombustion, d.fugitive, d.sealevel];

		// remove current values and current year
		gs.selectAll('g > text.values').remove();
		legenda.selectAll('text.year_label').remove();

		// append new year to legenda
		legenda.append('text')
			.attr('class', 'year_label')
			.attr('transform', 'translate(30, 60)')
			.style('font-size', '60px')
			.style('font-weight', 'bold')
			.text(hover_year);

		// append new values to legenda
		gs.selectAll('g')
			.append('text')
			.attr('class', 'values')
			.attr('transform', function(d, i) {
				var y = i * 35 + 15;
				var x = 230;
				return 'translate(' + x + ',' + y + ')';
			})
			.style('font-size', '16px')
			.style('font-weight', 'bold')
			.text(function(d, i) {
				// the sealevel is unkonwn in 1992 SO:
				return ((hover_year == 1992 && i == 5) ? "Unknown" : (d3.format(".0f")(values[i]) + (i != 5 ? " Mt CO₂" : " mm")));
			});
	}
}

// define a global variable used for updating the sunburst after time bar change
var stored_code;

// draw sunburst
function Draw_Sunburst(year, data, continent, sea_data) {

	// script which creates sunburst
	var width = 700,
		height = 600,
		radius = Math.min(width, height) / 2 - 50;

	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);

	var y = d3.scale.pow().exponent(1.2)
		.range([0, radius]);


	// some random coloring for the countries and continents
	var color = [];
	color[0] = '#bdbdbd';
	color[1] = '#737373'; // darkgrey


	var industry_color = new Object;
	industry_color = {
		'electricandheat': 'rgb(81, 117, 159)',
		'manufacturing': '#fed976	',
		'transportation': '#d73027',
		'fuelcombustion': 'rgb(79, 143, 111)'
	};

	var svg = d3.select("#sunburst").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 1.75 + "," + (height / 2 + 10) + ") rotate(-90 0 0)");

	var partition = d3.layout.partition()
		.sort(null)
		.value(function(d) {
			return d.size;
		});

	var arc = d3.svg.arc()
		.startAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
		})
		.endAngle(function(d) {
			return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
		})
		.innerRadius(function(d) {
			return Math.max(0, y(d.y));
		})
		.outerRadius(function(d) {
			return Math.max(0, y(d.y + d.dy));
		});

	// add current year to sunburst
	var hover_year_2 = svg.append('text')
		.attr('class', 'hover_year')
		.attr('id', 'hover_year')
		.attr('text-anchor', 'begin')
		.style('font-family', 'sans-serif')
		.style('font-size', '40px')
		.style('font-weight', 'bold')
		.style('fill', 'grey')
		.attr('transform', 'translate(260, -290)rotate(90)');

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
		var i = d3.interpolate({
			x: this.x0,
			dx: this.dx0
		}, a);
		return function(t) {
			var b = i(t);
			console.log(window);
			_self.x0 = b.x;
			_self.dx0 = b.dx;
			return arc(b);
		};
	}

	// update sunburst
	var updateChart = function(items, sea_data) {
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
				if ("ccode" in d) {
					return d.ccode;
				}
			})
			.on("mouseover", function(d) {
				hover_year_2.style('display', null);
				document.getElementById('hover_year').textContent = (d.ccode ? d.name : (d.parent ? d.parent.name : d.name));
			})
			.on("mouseout", function() {
				hover_year_2.style('display', 'none')
			});

		// coloring
		gs.select('path')
			.style("fill", function(d, i) {
				// countries and continents are random, industries with default colors
				return (d.depth == 0 ? 'black' : (d.children ? color[i % 2] : industry_color[d.name]));

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
		function Sunburst_Legend(items) {

			var legend_data = items.children["0"].children;
			var industry_leafs = [];
			legend_data.forEach(function(d) {
				industry_leafs.push(d.name);
			})

			// first remove current legenda
			d3.select('#legend_sunburst > g').remove();

			// draw new legenda with new colors
			var svg = d3.select('#legend_sunburst');

			svg.append('g')
				.attr('class', 'sunburst_legend');

			// this line is somewhat hardcoded since I used the d3.legend as reference
			var gs = svg.selectAll('g').data(industry_leafs).append('g').attr('class', 'legend_cells').attr('transform', 'translate(0, 520)');

			// add colored circles to legenda
			gs.selectAll('g').data(industry_leafs).enter().append("g")
				.attr('class', 'cell')
				.append('rect')
				.attr("transform", function(d, i) {
					var y = i * 35;
					var x = 5;
					return 'translate(' + x + ',' + y + ')';
				})
				.attr('width', 40)
				.attr('height', 25)
				.style('fill', function(d) {
					return industry_color[d];
				})

			var industry_name = new Object;
			industry_name = {
				'totalCO2': 'Total Emission',
				'electricandheat': 'Electric and Heat',
				'manufacturing': 'Manufacturing',
				'transportation': 'Transporation',
				'fuelcombustion': 'Fuel Combustion',
				'fugitive': 'Fugitive'
			};

			// add text
			gs.selectAll('g').append('text')
				.attr('class', 'label')
				.attr('transform', function(d, i) {
					var y = i * 35 + 15;
					var x = 60;
					return 'translate(' + x + ',' + y + ')';
				})
				.text(function(d) {
					return industry_name[d];
				});
		}

		// udpate legend
		Sunburst_Legend(items);

		var text = g.append("text");

		// add current year to sunburst
		var title = d3.select('#legend_sunburst')
			.append('text')
			.attr('class', 'legend_year')
			.attr('id', 'sunburst_year')
			.attr('text-anchor', 'begin')
			.style('font-family', 'sans-serif')
			.style('font-size', '50px')
			.style('font-weight', 'bold')
			.style('fill', 'grey')
			.attr('transform', 'translate(70, 480)');

		function Legenda_Values_Update(country) {

			// if zoomed to continent level remove values
			if (country.depth == 0) {
				// first remove current values
				d3.select('#legend_sunburst > g > g').selectAll('g > text.values').remove();
			}
			// if zoomed to country level assign new values, else do nothing
			else if (country.depth == 1) {
				// remove current values
				d3.select('#legend_sunburst > g > g').selectAll('g > text.values').remove();
				// add new values to legenda
				var gs = d3.select('#legend_sunburst > g').selectAll('g');
				gs.selectAll('g').data(country.children)
					.append('text')
					.attr('class', 'values')
					.attr('transform', function(d, i) {
						var y = i * 35 + 15;
						var x = 200;
						return 'translate(' + x + ',' + y + ')';
					})
					.style('font-size', '16px')
					.style('font-weight', 'bold')
					.text(function(d) {
						return (d3.format(".0f")(d.size) + " Mt CO₂");
					});
			}

			// when zoomed directly to industry level use parent object
			else {
				// remove current values
				d3.select('#legend_sunburst > g > g').selectAll('g > text.values').remove();
				// add new values to legenda
				var gs = d3.select('#legend_sunburst > g').selectAll('g');
				gs.selectAll('g').data(country.parent.children)
					.append('text')
					.attr('class', 'values')
					.attr('transform', function(d, i) {
						var y = i * 35 + 15;
						var x = 200;
						return 'translate(' + x + ',' + y + ')';
					})
					.style('font-size', '16px')
					.style('font-weight', 'bold')
					.text(function(d) {
						return (d3.format(".0f")(d.size) + " Mt CO₂");
					});
			}
		}

		// update sunburst on click
		function click(d) {
			// Update linechart when clicked on country
			if (d.ccode) {
				Update_Linechart(data, Country_Path(d.ccode), sea_data);
				// store country code for later use
				stored_code = d.ccode;
			};

			// update legend to clicked continent or country
			if (d.depth == 0) {
				Update_Legend(d.name);
			} else if (d.depth == 1) {
				Update_Legend(d.ccode);
			} else if (d.depth == 2) {
				Update_Legend(d.parent.ccode);
			}

			// update legenda values to clicked country or continent
			Legenda_Values_Update(d);

			// transition
			path.transition()
				.duration(1000)
				.attrTween("d", arcTween(d));
		}

		updateChart.click = click;

		// EXIT - Remove old elements as needed.
		gs.exit().transition().duration(500).style("fill-opacity", 1e-6).remove();

	}

	var sunburst_data = Sunburst_Data(year, data, continent);

	// update chart to default year
	updateChart(sunburst_data, sea_data);

	// in this way updateChart can be called from outside this function
	Draw_Sunburst.updateChart = updateChart;
	Draw_Sunburst.click = updateChart.click;
}

// draw slider
function Draw_Slider(year, sea_data) {
	var margin = {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		},
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
			.tickFormat(function(d) {
				return d;
			})
			.tickSize(0)
			.tickPadding(12))
		.select(".domain")
		.select(function() {
			return this.parentNode.appendChild(this.cloneNode(true));
		})
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

		// add x coordinate and current year to slider (needed for other functions)
		handle.attr("cx", x2(value))
			.attr("curr_year", value);

		// change year in header
		document.getElementById("title_year").textContent = d3.format('.0f')(value);
		document.getElementById("sunburst_year").textContent = d3.format('.0f')(value);

	}

	function hue(h) {
		handle.attr("cx", x(h));
		svg.style("background-color", d3.hsl(h, 0.8, 0.8));
	}

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
				Draw_Sunburst.updateChart(Sunburst_Data(year, data, curr_continent), sea_data);

				// this is a last minute hardcoded solution to bypass a incorrect sunburst
				var current = d3.select('#legend_sunburst > text.legend_title')["0"]["0"].innerHTML;

				// if sunburst was zoomed on country zoom in on that country again
				if (current != curr_continent) {
					var country_object = d3.select('#' + stored_code)["0"]["0"].__data__;
					Draw_Sunburst.click(country_object);
				}

				return year;
			})))
			.call(brush.event);
	}
}
