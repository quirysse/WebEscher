# Symmetries — The 17 wallpaper groups

Periodic plane tilings are classified by the **17 wallpaper groups** (plane crystallographic groups). Each group is determined by:

1. A **lattice**: the set of translation vectors (oblique, rectangular, rhombic, square, or hexagonal).
2. **Symmetries** of the fundamental cell: rotations (180°, 90°, 120°, 60°), reflections (mirror lines), and/or **glide reflections** (reflect then translate along the mirror).

WebEscher uses the same group IDs as in the table below. When you pick a group in the app, you edit one **prototype tile**; the app applies that group’s symmetries to fill the plane.

---

## Groups by family

| Family       | Groups | Lattice    | Symmetries |
|-------------|--------|------------|------------|
| **Oblique** | p1, p2 | Oblique    | **p1**: translations only. **p2**: plus 180° rotation around cell center. |
| **Rectangular** | pm, pg, pmm, pmg, pgg, cmm | Rectangular | **pm**: reflection in one direction. **pg**: glide only. **pmm**: two perpendicular reflections. **pmg**: reflection + glide. **pgg**: two perpendicular glides. **cmm**: reflections along diagonals. |
| **Rhombic** | cm     | Rhombic    | **cm**: one reflection direction (cell is a rhombus). |
| **Square**  | p4, p4m, p4g | Square   | **p4**: 90° rotation (4-fold). **p4m**: 90° + reflections. **p4g**: 90° + glides. |
| **Hexagonal** | p3, p3m1, p31m, p6, p6m | Hexagonal | **p3**: 120° rotation (3-fold). **p3m1** / **p31m**: 120° + reflections (two variants). **p6**: 60° rotation (6-fold). **p6m**: 60° + reflections. |

---

## Group IDs in code

The app and data use these string IDs (see `src/data/wallpaperGroupsData.ts`):

- **Oblique:** `p1`, `p2`
- **Rectangular:** `pm`, `pg`, `pmm`, `pmg`, `pgg`, `cmm`
- **Rhombic:** `cm`
- **Square:** `p4`, `p4m`, `p4g`
- **Hexagonal:** `p3`, `p3m1`, `p31m`, `p6`, `p6m`

---

## When to use which group

- **p1** — Simplest: only repetition by translation. Good to start with.
- **p2** — Adds 180° rotation; you draw half a motif, it is completed by rotation.
- **p4** — Quarter of a motif in one corner; 90° rotations complete the cell. Common in tiles and logos.
- **p6** — Sixth of a motif; 60° rotations. Honeycomb-like patterns.
- **pm, pg, pmm, …** — When you want mirror or glide symmetry (e.g. friezes extended to the plane).
- **p3, p3m1, p31m** — Triangular / hexagonal feel; 120° symmetry.

For more detail on how transforms are built, see the technical reference in `.cursor/skills/webescher-project/reference.md` (cell transforms, lattice).
