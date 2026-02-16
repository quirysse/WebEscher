# Transformations — What the app does

WebEscher uses several kinds of **transformations** to go from your edited prototype tile to the full picture. This page summarizes them at a high level.

---

## 1. Translation (repeating the cell)

The **lattice** defines how the fundamental cell is repeated in the plane. For every cell whose bounding box intersects the visible viewport, the app places a copy of the cell. So the first transformation is **translation** by integer combinations of the lattice vectors.

**In the app:** You can **pan** (drag the canvas) to move the view; the tiling is infinite, so translation is applied to as many cells as needed to fill the screen.

---

## 2. Cell symmetries (rotations, reflections, glides)

Inside each cell, the **wallpaper group** defines a set of **affine transforms** (rotations, reflections, glide reflections) that map the prototype tile to other positions in the cell. For example:

- **p1**: one transform (identity) — the prototype is the whole cell.
- **p2**: two — identity and 180° rotation around the cell center.
- **p4**: four — 0°, 90°, 180°, 270° around the center.
- **p6**: six — every 60° around the center.
- **pm, pg, pmm, …**: identity plus reflections and/or glides.

Each instance drawn on the canvas is “prototype transformed by (translation × cell transform)”. So the second kind of transformation is **rotation, reflection, or glide** applied per copy within each cell.

(Technical detail: see `.cursor/skills/webescher-project/reference.md` for the pipeline and `getCellTransforms`.)

---

## 3. Homothety (optional scaling by position)

**Homothety** in WebEscher is a **change of scale of the tiling** depending on position. It is not a symmetry of the lattice; it deforms the strict periodicity to create perspective-like or frame-like effects.

The app offers three modes:

- **Horizontal (smaller right)** — The scale of the motif decreases as you go to the right (and increases to the left). Similar to Escher’s “fish” tilings where size diminishes in one direction.
- **Border** — The scale is largest near the center of the view and decreases toward the edges. This gives a **frame** effect: the tiling appears to shrink as it approaches the border of the canvas.
- **Hole (center)** — The scale is smallest at the center of the view and increases with distance from the center. The tiling appears to shrink into a **hole** in the middle.

In all cases, each tile is scaled around its own center; only the scale factor varies with the tile’s position (e.g. distance from view center or horizontal coordinate). So homothety is a **position-dependent scaling** of the same tiling, not a new symmetry type.

---

## Summary

| Transformation   | Role in the app |
|------------------|------------------|
| **Translation**  | Repeats the cell over the plane; pan moves the view over this infinite grid. |
| **Rotation**      | From the group (p2, p4, p3, p6): 180°, 90°, 120°, 60° around cell centers. |
| **Reflection**   | From the group (pm, pmm, p4m, p6m, etc.): mirror axes. |
| **Glide**        | From the group (pg, pmg, p4g, etc.): reflect then translate along the axis. |
| **Homothety**    | Optional: scale of each tile depends on position (horizontal / border / hole). |

The 17 groups are defined by the combination of lattice + rotations/reflections/glides; homothety is an extra visual effect applied on top.
