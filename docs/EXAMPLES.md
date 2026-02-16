# Examples — Understanding symmetries

This page gives short, concrete ways to read and try the symmetries in WebEscher.

---

## The four types of isometries

In the plane, repeating patterns use these symmetries:

1. **Translation** — Shift the motif by a fixed vector. The lattice (parallelogram or hexagon) defines how the cell is repeated in all directions. In the app, you always get translation (the grid); the group adds extra symmetries *within* each cell.

2. **Rotation** — Rotate the motif around a point (180°, 90°, 120°, or 60°). For **p4** you have four positions (0°, 90°, 180°, 270°); for **p6** you have six (every 60°). You only draw the part that is repeated by rotation (e.g. one quarter for p4).

3. **Reflection** — Mirror the motif across a line. Groups like **pm** or **pmm** add mirror axes. What you draw on one side of the axis appears reflected on the other.

4. **Glide reflection** — Reflect across a line, then translate along that line by half a step. **pg**, **pmg**, **p4g** use glides. The motif appears “flipped and shifted” along the glide axis.

---

## Try it in the app

- **p1** — Select p1, draw any closed shape in the dashed cell. You should see it repeated in a simple grid. No rotation or mirror; only translation.

- **p2** — Select p2. Draw *half* of a symmetric shape (e.g. one wing). The 180° rotation completes the other half. Good for butterflies, leaves, etc.

- **p4** — Select p4. Draw a shape in *one quarter* of the cell (e.g. top-right corner). The app rotates it 90°, 180°, and 270° to fill the cell. Try a small L or a curved hook.

- **p6** — Select p6. Draw one sixth of a motif (e.g. one “petal” around the center). The 60° rotations complete a hexagonal pattern.

- **pm** — Select pm. Draw on one side of the vertical midline; the reflection fills the other side. Then the whole cell is translated.

- **Homothety** — After choosing a group, enable “Homothety” and try “Horizontal (smaller right)”: the tiling scale decreases toward the right, Escher-style. “Border” shrinks toward the edges (frame effect); “Hole” shrinks toward the center.

---

## Reading a pattern

When you look at a tiling:

- **Repeated cells** → translation (lattice).
- **Spots that look like rotation centers** → 2-, 4-, 3-, or 6-fold rotation (p2, p4, p3, p6, etc.).
- **Mirror lines** → reflection (pm, pmm, p4m, p6m, etc.).
- **Flipped and shifted rows/columns** → glide (pg, pmg, p4g, etc.).

The 17 groups are exactly the possible combinations of these, up to the shape of the lattice. For a full list and code IDs, see [Symmetries](SYMMETRIES.md).
