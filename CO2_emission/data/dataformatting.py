import csv

datafile = open('visualizationdata.csv');
datareader = csv.reader(datafile);
visualizationdata = list(datareader);

print "Rows:" + str(len(visualizationdata));

with open('CO2_emission3.json', 'w') as targetfile:
    targetfile.write('{\n "1992": [\n {"Africa":[{\n "ccode": "%s",\n "name": "%s",\n "totalCO2": "%s",\n "electricandheat": "%s",\n "manufacturing": "%s",\n "transportation": "%s",\n "fuelcombustion": "%s", \n "fugitive": "%s" \n },\n' % (visualizationdata[1][2],
        visualizationdata[1][3], visualizationdata[1][9], visualizationdata[1][4], visualizationdata[1][5], visualizationdata[1][6], visualizationdata[1][7], visualizationdata[1][8]));
    i = 2;
    while i < (len(visualizationdata)):
        if visualizationdata[i][0] != visualizationdata[i - 1][0]:
            targetfile.write('"%s": [' % visualizationdata[i][0]);
        if visualizationdata[i][1] != visualizationdata[i - 1][1]:
            targetfile.write('{"%s": [' % visualizationdata[i][1]);
        targetfile.write('{\n "ccode": "%s",\n "name": "%s",\n "totalCO2": "%s",\n "electricandheat": "%s",\n "manufacturing": "%s",\n "transportation": "%s",\n "fuelcombustion": "%s", \n "fugitive": "%s" \n }' % (visualizationdata[i][2],
            visualizationdata[i][3], visualizationdata[i][9], visualizationdata[i][4], visualizationdata[i][5], visualizationdata[i][6], visualizationdata[i][7], visualizationdata[i][8]));
        try:
            if (visualizationdata[i][1] != visualizationdata[i + 1][1]) and (visualizationdata[i][0] != visualizationdata[i + 1][0]):
                targetfile.write(']}\n');
            else:
                if visualizationdata[i][1] != visualizationdata[i + 1][1]:
                    targetfile.write(']},\n');
                else:
                    targetfile.write(',\n');
            if visualizationdata[i][0] != visualizationdata[i + 1][0]:
                targetfile.write('],\n');
            i += 1;
        except IndexError:
            targetfile.write(']\n } \n ] \n }');
            break
