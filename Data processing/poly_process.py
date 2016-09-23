#!/usr/bin/env python

import glob,os
import grass.script as grass

# Insert Path to input maps folder
lyrs_in = "/home/user/test/mygeoss_poly/"

# Insert Path to folder for output map storing
lyrs_out = "/home/user/test/mygeoss_poly/"

# Processing
os.chdir(lyrs_in)
layers=[]
for file in glob.glob("*.shp"):
    layers.append(file)

       
for item in layers:      
    grass.run_command("v.in.ogr",input=item,output=item.split(".")[0],quiet=True)  
    chk = grass.read_command("v.info",map=item.split(".")[0],flags="t")
    if (chk.split("\n")[5]).split("=")[1] > 0:
        grass.run_command("g.region", res=10)
        grass.run_command("v.to.rast", input=item.split(".")[0], output=item.split(".")[0]+"_10", use="val", quiet=True)
        grass.run_command("r.buffer", input=item.split(".")[0]+"_10", output="B"+item.split(".")[0]+"_10", distances="400,800,1200", quiet=True)
        grass.mapcalc("$out=if($inp==1,1,if($inp==2,0.75,if($inp==3,0.5,if($inp==4,0.25,0))))",out="N"+item.split(".")[0]+"_10", inp="B"+item.split(".")[0]+"_10")
        grass.run_command("r.null", map="N"+item.split(".")[0]+"_10", null=0,quiet=True)
        grass.run_command("g.region", res=200)
        grass.run_command("r.resample",input="N"+item.split(".")[0]+"_10", output="N"+item.split(".")[0]+"_200",quiet=True)
        grass.run_command("r.out.gdal", input="N"+item.split(".")[0]+"_200", output=lyrs_out+"N"+item.split(".")[0]+"_200.tiff",quiet=True)
        
