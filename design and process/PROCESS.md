# day 1
Submitted first proposal with decent references which had me inspired such as TasteKid (website), Cinemetrics (project from student) and Discovr Music (app). First rough sketch idea of building dot interactive dot visualization:
![](doc/rough_sketch.jpg)

# day 2
Decided that the movie linked dot visualization is too ambitious as it involves both a search engine and visualization. Besides the fact that it might be too complicated there is not much of a 'problem', rather a funny event to solve (namely which film do you want to watch). Worked out a new visualization idea in the form of a sunburst about CO2 emission per industry per country in the last 25 years. This sunburst is linked to a 'timeshift' such that the user can see the CO2 emission development throughout the last decades.

# day 3
- After 10 o'clock stand up meeting I obtained some useful feedback from fellow students so I can make my plans more specific. Namely adding a worldmap as third interactive visualization linked to the sunburst such that when the user clicks on a country in the worldmap the sunburst automatically adjust to that specific country. In addition, one of my fellow students gave me a website tip where I exactly found the data I need for the major part of my visualization project (that is the CO2 emission per industry per every country in the world from 1990 to 2012).
- Wrote Design document, sketched webpage look and searched for appropriate data format. I think I first might work out the structure of the linked visualization in order to conclude which data format is the most easy to work with.
- Rewrote proposal. It is not clear to me what part of the description of my webpage should be written in the README file and what part belongs in the DESIGN document...

# day 4
Started writing of main HTML page with World Map in javascript including necessary D3 libraries. TO DO Day 4: think of appropriate JSON format and convert data.

# day 5
- Continued with main HTML page, at this moment it gives a clear view of what it is going to look like in the end;
- Gave some structure to Github repository;
- Start with data format

# day 6
Today I mainly have been working on the correct data format. Raw data was in Excel file, target format is two-keyed JSON (First key: year, second key: continent). I am trying to format the data with a small python script, I think I will get it done today.
- Update day 6, evening: finished data formatting into JSON file. Checked with online JSON validator, data is valid :). 



