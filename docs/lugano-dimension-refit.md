# Lugano dimension refit

## Overview
The Lugano floor plans are rebuilt from the centimeter measurements captured in
`lugano_original_dimensionSpec.json`. The default floorplan topology is now
explicitly laid out in `src/data/lugano/floorplan-data.js` so the room geometry
matches the measured dimensions without relying on the legacy draft layout.

## Units and scale
- Source dimensions are in centimeters (cm).
- Plan coordinates are in pixels with `MM_PER_PX = 20`, so `1 px = 2 cm`.
- Conversion:
  - `cm = px * 2`
  - `px = cm / 2`

## Source files
- Raw measurement capture: `lugano_original_dimensionSpec.json`
- Mapped spec files:
  - `src/data/lugano/dimensionSpec.firstFloor.json`
  - `src/data/lugano/dimensionSpec.groundFloor.json`
- Geometry layout: `src/data/lugano/floorplan-data.js`

## Mapping notes
- Room ids are preserved, but the topology is rebuilt to match the blueprint
  dimensions from the JSON spec.
- Rooms that only have a single measured dimension (e.g., dining width or
  doccia width) are given layout-derived heights to fit the plan. These rooms
  are marked as such in the spec notes.
- Opening widths/heights come directly from the source labels. Offsets along
  walls are centered unless an explicit offset is required to avoid overlap.
- Measurements that cannot be represented by the rectangular-room model (e.g.,
  chain segments, fixture sizes) are listed in each spec file under
  `unmappedMeasurements`.

## Updating the specs
1. Edit `lugano_original_dimensionSpec.json` if the raw capture changes.
2. Update the mapped spec JSON files in `src/data/lugano/` to reflect the new
   constraints and room/opening mappings.
3. Keep the layout in `src/data/lugano/floorplan-data.js` aligned with the spec
   values. Use centimeters and convert with `MM_PER_PX`.

## Validation
Run the unit tests:

```sh
npm run test:unit
```

The tests in `tests/lugano-dimensions.test.mjs` assert:
- Room widths/heights for every room with measured dimensions.
- Opening widths/heights for all mapped openings.
- Overall outer bounds (width and height) per the spec.
