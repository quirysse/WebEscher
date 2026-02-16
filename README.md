# WebEscher

Escher-like **periodic plane tiling** editor. Create motifs in a fundamental cell; the app repeats them using the 17 **wallpaper groups** (plane crystallographic groups). React + TypeScript + Vite.

**Demo:** [https://webescher.igloox.com/](https://webescher.igloox.com/)

---

## Pedagogy

WebEscher is meant to help understand:

- The **17 wallpaper groups**: the complete classification of repeating 2D patterns (translations, rotations, reflections, glide reflections).
- How **symmetries** combine: e.g. p4 (90° rotation), p6 (60° rotation), pm (mirror), pg (glide).
- Real-world examples: the **Alhambra** (Grenade), Islamic tilings, and M. C. Escher’s work.

You edit one **prototype tile**; the chosen group’s symmetries fill the plane. Optional **homothety** modes change the scale of the tiling by position (horizontal gradient, border frame, or central “hole”).

---

## Documentation

- [**Symmetries**](docs/SYMMETRIES.md) — The 17 groups by family, with short descriptions and code IDs.
- [**Examples**](docs/EXAMPLES.md) — How to read and try symmetries in the app.
- [**Alhambra**](docs/ALHAMBRA.md) — Tilings in art and architecture (Alhambra, Escher, zelliges).
- [**Transformations**](docs/TRANSFORMATIONS.md) — Translation, rotations, reflections, glides, and homothety in the app.

---

## Tech

- **Requirements:** Node.js 18+
- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
