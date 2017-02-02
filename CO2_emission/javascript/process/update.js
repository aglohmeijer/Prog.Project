// Student: Anne Lohmeijer
// UvA-ID: 10447555
// File: update.js

// function to update linechart when user clicks on new country
function Update_Linechart(data, country_link, sea_data){
	d3.select("#linechart > svg").remove();
	d3.select('#linechart_legend > g').remove();
	Draw_Linechart(data, country_link, sea_data);
}

// this function updates the sunburst legenda to the current continent/country
function Update_Legend(new_country){

	// first remove current country
	d3.select('#legend_sunburst > text.legend_title').remove();

	// define title object
	var title = d3.select('#legend_sunburst')
		.append('text')
		.attr('class', 'legend_title')
		.attr('text-anchor', 'begin')
		.attr('font-family', 'sans-serif')
		.attr('font-size', '50px')
		.attr('font-weight', 'bold')
		.attr('transform', 'translate(50, 480)rotate(-90)');

	// if the sunburst focusses on one country use coutnry ID, else append continent name to legend
	if (new_country.length == 3){

			title.text((Country_Path(new_country)).name);
	}
	else {
		title.text(new_country);
	}
}

// function to retrieve indices and keys from a given country in the general data set (very usefull!);
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
