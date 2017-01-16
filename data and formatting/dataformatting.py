import csv

datafile = open('visualizationdata.csv');
datareader = csv.reader(datafile);
visualizationdata = list(datareader);

with open('jsondata', 'w') as targetfile:
    i = 2;
    while True:
        if visualizationdata[i][0] != visualizationdata[i -1][1]:
            targetfile.write('"%s": [' % visualizationdata[i][0]);
        if visualizationdata[i][1] != visualizationdata[i - 1][1]:
            targetfile.write('"%s": [' % visualizationdata[i][1]);
        targetfile.write('{\n "ccode": "%s",\n "name": "%s",\n "totalCO2": "%s",\n "electricandheat": "%s",\n "manufacturing": "%s",\n "transportation": "%s",\n "fuelcombustion": "%s", \n "fugitive": "%s" \n }' % (visualizationdata[i][2],
            visualizationdata[i][3], visualizationdata[i][9], visualizationdata[i][4], visualizationdata[i][5], visualizationdata[i][6], visualizationdata[i][7], visualizationdata[i][8]));
        if visualizationdata[i][1] != visualizationdata[i + 1][1]:
            targetfile.write('],\n');
        else:
            targetfile.write(',\n');
        if visualizationdata[i][1] != visualizationdata[i + 1][1]:
            targetfile.write('],\n');
        i += 1;
