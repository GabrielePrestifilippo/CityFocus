##Readme
The server side is composed by an Ubuntu 14.04 LTS with [rasdaman](http://rasdaman.org/) installed.

The rasmadan installation was performed using the stable packages for Ubuntu.
See instruction at the following link.

[http://www.rasdaman.org/wiki/InstallFromDEB](http://www.rasdaman.org/wiki/InstallFromDEB)

After the installation the raster data can be ingested using the command
```
$ rasimport -f /pathto/raster.tiff --coll 'raster' --coverage-name 'raster' -t DoubleImage:DoubleSet --crs-uri '%SECORE_URL%/crs/EPSG/0/32632'
```
