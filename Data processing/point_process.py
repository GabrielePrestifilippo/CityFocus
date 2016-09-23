#!/usr/bin/python

import glob,os
import grass.script as grass


# Insert Path to input maps folder
lyrs_in = "/home/user/test/mygeoss_points/"
    
# Insert Path to folder for output map storing
lyrs_out = "/home/user/test/mygeoss_points/"
    
    
# Processing
os.chdir(lyrs_in)
layers=[]
for file in glob.glob("*.shp"):
    layers.append(file)


for item in layers:
    grass.run_command("v.in.ogr",input=item,output=item.split(".")[0],quiet=True)
    chk = grass.read_command("v.info",map=item.split(".")[0],flags="t")
    if (chk.split("\n")[1]).split("=")[1] > 0:
        grass.run_command("v.kernel",input=item.split(".")[0],output=item.split(".")[0],radius=1200,kernel="quartic",overwrite=True, quiet=True)
        max = (grass.read_command("r.univar", map=item.split(".")[0], flags="g").split("\n"))[4].split("=")[1]
        grass.mapcalc("$out = $inp/$max", out="N"+item.split(".")[0], inp=item.split(".")[0], max=max)
        grass.run_command("r.out.gdal", input="N"+item.split(".")[0], output=lyrs_out+"N"+item.split(".")[0]+".tiff", quiet=True)
