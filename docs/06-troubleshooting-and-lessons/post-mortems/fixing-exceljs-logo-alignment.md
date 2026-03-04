# Post-Mortem: ExcelJS Logo Image Centering (~8 Hours of Debugging)

## The Incident
When generating Excel workshop reports from `HODWorkshopManager.jsx`, the AUS logo image refused to center properly no matter what coordinates were provided to ExcelJS's `addImage()` method. This consumed approximately 7-8 hours of developer time across multiple debugging sessions.

## Root Cause Analysis
ExcelJS's `addImage()` accepts a `tl` (top-left) anchor with `col` and `row` as floating-point numbers (e.g., `col: 3.99`). Internally, ExcelJS converts these decimal values into Excel's native EMU (English Metric Unit) coordinate system for the `<xdr:twoCellAnchor>` XML element. **This conversion is unreliable.** Small changes in the decimal — like `col: 4.0` vs `col: 4.1` — produced wildly different visual positions when the file was opened in desktop Microsoft Excel. The behavior was non-linear and unpredictable.

## Timeline of Failed Attempts

| # | Strategy | Code | Result |
|---|----------|------|--------|
| 1 | Fractional column anchor | `tl: { col: 3.99, row: 1.0 }` | Not centered, too far left |
| 2 | Manual right shifts | `col: 4.5`, `4.2`, `4.1`, `4.0` | All produced bizarre, unpredictable jumps |
| 3 | Mathematical center calculation | `col: 3.3` (based on column width math) | Too far left |
| 4 | Bounding box anchors (`tl` + `br`) | `tl: { col: 3.5 }`, `br: { col: 5.5 }` | Still off-center |
| 5 | Full-width letterhead (997px) | `tl: { col: 2 }`, `ext: { width: 997 }` | Centered, but logo was unacceptably enlarged |
| 6 | Midpoint interpolation | `col: 3.65` with `editAs: 'oneCell'` | Still incorrect |
| 7 | Pure integer anchor | `tl: { col: 3, row: 1 }` | Close but not precise enough |

**Key insight:** The fractional `col`/`row` API is fundamentally broken for pixel-precise positioning.

## The Fix — Native EMU Offsets
ExcelJS supports an alternative anchoring format using `nativeCol`, `nativeColOff`, `nativeRow`, and `nativeRowOff`. These map **directly** to Excel's internal XML coordinate system, bypassing the buggy decimal-to-EMU conversion entirely.

### How to Calculate the Centered Position

1. **Convert column widths to pixels:** `pixels = width × 7 + 5` (at 96 DPI)
2. **Sum all columns** to get total sheet width in pixels
3. **Find center start:** `leftEdge = (totalWidth - imageWidth) / 2`
4. **Identify which column** the pixel falls in (cumulative widths), compute the pixel offset within that column
5. **Convert to EMU:** `offset_emu = offset_pixels × 9525`

### Calculation for our 7-column layout:

| Column | Width (chars) | Width (px) | Cumulative (px) |
|--------|--------------|------------|-----------------|
| A (S.No) | 8 | 61 | 61 |
| B (Academic Year) | 18 | 131 | 192 |
| C (Activity Name) | 45 | 320 | 512 |
| D (From Date) | 15 | 110 | 622 |
| E (To Date) | 15 | 110 | 732 |
| F (Resource Person) | 30 | 215 | 947 |
| G (No. of Students) | 18 | 131 | 1078 |

- **Total:** 1078px, **Image:** 486×75px
- **Center start:** (1078 - 486) / 2 = **296px**
- **Falls in Column C** (starts at 192px), offset = 296 - 192 = **104px**
- **EMU:** 104 × 9525 = **990,600 EMU**

### Final Working Code
```javascript
worksheet.addImage(imageId, {
    tl: { nativeCol: 2, nativeColOff: 990600, nativeRow: 0, nativeRowOff: 47625 },
    ext: { width: 486, height: 75 },
    editAs: 'oneCell'
});
```

## Lessons Learned

1. **Never use fractional `col`/`row`** in ExcelJS for precise image placement. The decimal-to-EMU conversion is non-deterministic across Excel renderers.
2. **Always use `nativeCol` + `nativeColOff`** with calculated EMU values. This writes directly to Excel's XML and produces consistent results everywhere.
3. **1 pixel = 9,525 EMU** — this is the universal conversion constant for Excel's coordinate system.
4. **Column width to pixels:** `px = charWidth × 7 + 5` at standard 96 DPI. This formula is an approximation but works reliably for layout calculations.
5. **If image positioning feels random, you're probably hitting a library abstraction bug.** Drop down to the lowest-level API the library offers.
