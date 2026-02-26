# Hero Section Update - Instructions

## Current Status

✅ **Completed**: CSS improvements for better text readability with darker backgrounds
- Commit: 5ec13cc
- Overlay opacity increased to 60%
- All text now white with enhanced shadows
- Hero tag improved with backdrop blur and border
- Lead text font size increased to 1.1rem

## Next Steps

### 1. Upload the New Hero Image

Please upload the evening team photo `20260129_052137(1).jpg` to the repository:

```bash
# Place the file in this directory:
buibui-theme/static/assets/img/20260129_052137(1).jpg
```

### 2. Optimize the Image

Once uploaded, run the optimization script:

```bash
./optimize-hero-image.sh buibui-theme/static/assets/img/20260129_052137(1).jpg
```

This will:
- Resize the image to max width 1920px (maintaining aspect ratio)
- Convert to WebP format for 90%+ file size reduction
- Optimize with quality 85 for best balance
- Output to `buibui-theme/static/assets/img/hero-image.webp`

### 3. Verify the Result

Build and view the site:

```bash
make clean
RELATIVE=1 make html
cd output && python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Expected Result

The hero section will display the evening team photo with excellent text readability:
- White text with strong shadows
- 60% dark overlay for contrast
- All team members visible
- "Join Us" button prominently displayed

## Image Details

Based on the provided screenshot, the evening photo shows:
- Team members in casual running gear
- Evening/dusk lighting (darker than the previous daytime photo)
- Good composition with team spread across the frame
- Urban running environment visible in background

## CSS Changes Summary

The CSS updates ensure readability on darker backgrounds:

```css
/* Increased overlay for better contrast */
.hero .hero-overlay {
  background: rgba(0, 0, 0, 0.6); /* was 0.5 */
}

/* White text with enhanced shadows */
.hero h1 {
  color: #ffffff;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 0, 0, 0.5);
}

.hero .lead {
  color: #ffffff;
  font-size: 1.1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(0, 0, 0, 0.5);
}
```

These changes work perfectly with the darker evening photo while still looking good with lighter backgrounds.
