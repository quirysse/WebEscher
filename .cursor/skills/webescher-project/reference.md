# WebEscher — Plane tiling and wallpaper groups (reference)

## Escher and periodic tilings

M. C. Escher used **periodic tilings** (repeated motifs that fill the plane without gaps or overlaps). The mathematical classification of such tilings is given by the **17 wallpaper groups** (also called plane crystallographic groups). Each group is defined by:

1. A **lattice** (discrete set of translation vectors): parallelogram (oblique, rectangular, rhombic, square) or hexagonal.
2. **Point symmetries** of the cell: rotations (180°, 90°, 120°, 60°) and/or reflections (mirror lines) and/or **glide reflections** (reflect then translate along the mirror).

The combination of lattice + symmetries yields exactly 17 distinct groups. WebEscher lets the user pick one group and edit a single **prototype tile** in the fundamental cell; the app applies the group’s symmetries to fill the viewport.

## The 17 groups (by family)

| Family       | Groups | Lattice   | Typical symmetries |
|-------------|--------|-----------|---------------------|
| Oblique     | p1, p2 | Oblique   | p1: translations only. p2: + 180° rotation. |
| Rectangular | pm, pg, pmm, pmg, pgg, cmm | Rectangular | Reflections (pm, pmm, cmm), glides (pg, pmg, pgg). |
| Rhombic     | cm     | Rhombic   | One reflection direction. |
| Square      | p4, p4m, p4g | Square | 90° rotation; p4m/p4g add reflections/glides. |
| Hexagonal   | p3, p3m1, p31m, p6, p6m | Hexagonal | 120° or 60° rotation; some add reflections. |

**IDs in code**: `p1`, `p2`, `pm`, `pg`, `pmm`, `pmg`, `pgg`, `cmm`, `cm`, `p4`, `p4m`, `p4g`, `p3`, `p3m1`, `p31m`, `p6`, `p6m`.

## Lattice types (engine/lattice.ts)

- **Square**: base vectors (1,0) and (0,1) → square grid.
- **Rectangular**: same as square in normalized form; cell can be scaled differently if needed.
- **Rhombic**: 60° parallelogram, e.g. (1,0) and (0.5, √3/2).
- **Oblique**: same base as rhombic in this codebase.
- **Hexagonal**: same base vectors; used for 3- and 6-fold groups.

Translations are generated for all cells whose bounding box intersects the viewport (`getTranslationsForViewport`).

## Cell transforms (engine/wallpaperGroups.ts)

For each group, `getCellTransforms(tileSize)` returns a list of **affine transforms** that map the prototype (in `[0, tileSize]²`) to each tile **inside one cell**. The center of the cell is `(tileSize/2, tileSize/2)`.

- **p1**: 1 transform (identity).
- **p2**: 2 (identity, 180° rotation around cell center).
- **pm**: 2 (identity, reflection in vertical line + translation).
- **p4**: 4 (identity, 90°, 180°, 270° around center).
- **p3**: 3 (120° rotations).
- **p6**: 6 (60° rotations).
- etc.

Each transform is stored as a 3×3 row-major affine matrix `[a,b,c,d,e,f,0,0,1]`; point transform is `(a*x+b*y+c, d*x+e*y+f)`.

## Affine math (utils/math.ts)

- `identity()`, `translation(tx, ty)`, `rotationAround(cx, cy, angle)`, `reflectX()`, `reflectY()`, `multiply(a, b)`, `applyToPoint(m, p)`.
- Used to build cell transforms and to apply them in `tileGenerator.transformPoint`.

## Tile generation pipeline

1. User selects wallpaper group and edits shape points (or uses default shape).
2. `generateTileInstances(groupId, tileSize, viewport)`:
   - Gets group def (lattice + cell transforms).
   - Gets translation transforms for viewport (`getTranslationsForViewport`).
   - For each translation T and each cell transform G, pushes instance with `transform = T * G` and `roleIndex` = index of G.
3. In TilingCanvas, for each instance: transform each shape point with `transformPoint(transform, p)`, draw polygon, color by `getRoleColor(roleIndex)`.
4. The “editor” shape is the prototype at the first cell (identity); its handles are the same points, drawn with dashed outline and circles.

## Constraints (engine/constraints.ts)

- **EdgeConstraint**: Describes that edge B must be the image of edge A under a transform (for keeping tile edges consistent when dragging).
- `getEdgeConstraints(groupId, tileSize)` returns constraints per group (currently returns `[]`).
- `applyConstraints(points, pointIndex, newPosition, ...)` can update multiple points when one is moved; currently only updates the moved point.

## Splines / curves

Shapes are stored and drawn as **polylines**. To support smooth curves (Escher-like fish, birds, etc.), the codebase could be extended with:

- Per-segment control points and use of `ctx.quadraticCurveTo` or `ctx.bezierCurveTo`, or
- A “smooth” mode that subdivides edges (existing `subdivideEdges`) or fits curves through vertices.

A short comment in TilingCanvas.tsx references this direction.
