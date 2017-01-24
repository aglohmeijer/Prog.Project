## day 1
Submitted first proposal with decent references which had me inspired such as TasteKid (website), Cinemetrics (project from student) and Discovr Music (app). First rough sketch idea of building dot interactive dot visualization:
![](doc/rough_sketch.jpg)

## day 2
Decided that the movie linked dot visualization is too ambitious as it involves both a search engine and visualization. Besides the fact that it might be too complicated there is not much of a 'problem', rather a funny event to solve (namely which film do you want to watch). Worked out a new visualization idea in the form of a sunburst about CO2 emission per industry per country in the last 25 years. This sunburst is linked to a 'timeshift' such that the user can see the CO2 emission development throughout the last decades.

## day 3
- After 10 o'clock stand up meeting I obtained some useful feedback from fellow students so I can make my plans more specific. Namely adding a worldmap as third interactive visualization linked to the sunburst such that when the user clicks on a country in the worldmap the sunburst automatically adjust to that specific country. In addition, one of my fellow students gave me a website tip where I exactly found the data I need for the major part of my visualization project (that is the CO2 emission per industry per every country in the world from 1990 to 2012).
- Wrote Design document, sketched webpage look and searched for appropriate data format. I think I first might work out the structure of the linked visualization in order to conclude which data format is the most easy to work with.
- Rewrote proposal. It is not clear to me what part of the description of my webpage should be written in the README file and what part belongs in the DESIGN document...

## day 4
Started writing of main HTML page with World Map in javascript including necessary D3 libraries. TO DO Day 4: think of appropriate JSON format and convert data.

## day 5
- Continued with main HTML page, at this moment it gives a clear view of what it is going to look like in the end;
- Gave some structure to Github repository;
- Start with data format

## day 6
Today I mainly have been working on the correct data format. Raw data was in Excel file, target format is two-keyed JSON (First key: year, second key: continent). I am trying to format the data with a small python script, I think I will get it done today.
- Update day 6, evening: finished data formatting into JSON file. Checked with online JSON validator, data is valid :).

## day 7
- Created an adjustable timebar in the center of the main HTML page below the world map, such that the user can choose the year between 1992 and 2012.
- Wrote a function which retrieves all data from the main JSON data file when a year is given as argument, it returns a new JSON data set corresponding to the new year.
- Main issue of day 7: updating the Chloropleth World map when adjusting the timebar. I am getting stuck on calling different functions from within other functions. I will continue working (and asking for help) on this problem tomorrow morning (day 8).

## day 8
- The Choropleth data map now updates automatically when the user adjusts the timebar. Spend roughly 5 hours to find out why it didn't work, turned out to be a misspell (it's choropleth, not chLoropleth);
- Added Pop Up on Hover with TOTAL CO2 in MtCO2. I don't think I will add the other 4/5 data fields to the Pop Up since the popup will then contain to much information.
- TODO day 9/10: Sunburst.

## day 10
### day 10 - morning
- Implemented Sunburst below the WorldMap, however not yet with my own data. I'm struggling with data formatting as the Sunburst contains a quite vertical Object/Array structure;

### day 10 - afternoon
- Implemented Sunburst with own data, not yet with correct coloring and titles.
- TODO: think of a way to render sunburst better, at this moment there are too many objects.

### day 10 - evening
- Sunburst works fine, on clicking I can console.log the parent + childrens I clicked on.
- Got extremely stuck on scopes from functions. If function A was out of scope I fixed it, then function B was out of scope etc.. It still doesn't work.

# day 12
- It took me literally ALL day today to figure out the d3.slider. I have finally made it work, for some reason I have to place the main script which calls the d3.slider after the <div slider itself.
- Added radio inputs above the map. TODO: when the user chooses one radio input the map should update to the new data (category: industry).

## day 12 - late
- The Map updates now on both change in industry as change in year on the slider. The variables 'industry' and 'year' remain intact througout the script.
- TODO: write functions for color transformation (i.e. every time the user adjusts year or industry the map changes color OR buttons where user can choose color scheme.
