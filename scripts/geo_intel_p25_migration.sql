-- Change the boundaries table geom column to generic Geometry type to support Points and Polygons
ALTER TABLE geo_intel.boundaries
ALTER COLUMN geom TYPE GEOMETRY(Geometry, 4326)
USING geom::geometry(Geometry, 4326);
