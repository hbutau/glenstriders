# Instructions: Upload and Optimize Hero Image

## Current Status
✅ CSS improvements complete - text contrast optimized for darker backgrounds
✅ Optimization script ready at `./optimize-hero-image.sh`
⏳ Waiting for image file: `20260129_052137(1).jpg`

## Next Steps

### 1. Upload the Image File

Please upload the evening team photo to the repository:

```bash
# Add the file to the repository
cp path/to/20260129_052137\(1\).jpg buibui-theme/static/assets/img/
cd /home/runner/work/glenstriders/glenstriders
git add buibui-theme/static/assets/img/20260129_052137\(1\).jpg
git commit -m "Add evening team photo for hero section"
git push origin copilot/redesign-hero-section
```

**Note**: The filename contains parentheses, so escape them when using in shell commands.

### 2. Optimize the Image

Once uploaded, run the optimization script:

```bash
cd /home/runner/work/glenstriders/glenstriders
./optimize-hero-image.sh "buibui-theme/static/assets/img/20260129_052137(1).jpg"
```

This will:
- Resize to max width 1920px (maintaining aspect ratio)
- Convert to WebP format
- Optimize with quality 85
- Save as `buibui-theme/static/assets/img/hero-image.webp`
- Reduce file size by ~90-95%

### 3. Build and Test

```bash
make clean
RELATIVE=1 make html
cd output && python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

### 4. Commit the Changes

```bash
git add buibui-theme/static/assets/img/hero-image.webp
git commit -m "Update hero section with evening team photo"
git push origin copilot/redesign-hero-section
```

## Expected Result

The hero section will display:
- **Image**: Evening/dusk team photo with darker lighting
- **Text**: White text with enhanced shadows for excellent readability
- **Overlay**: 60% dark overlay for optimal contrast
- **Button**: Orange "Join Us" button prominently displayed
- **Team**: All team members clearly visible in casual running gear

## Image Details

Based on the evening photo you provided:
- Shows team in evening/dusk lighting conditions
- Team members in various colored running attire
- Urban running environment visible in background
- Darker background requiring enhanced text contrast (already configured)

## CSS Already Configured

The following CSS improvements are already in place:

```css
/* Enhanced overlay */
.hero .hero-overlay {
  background: rgba(0, 0, 0, 0.6);
}

/* White text with strong shadows */
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

These ensure excellent readability against the darker evening background.

## Troubleshooting

If the optimization script fails:

### Manual Optimization

```bash
# Install ImageMagick if needed
sudo apt-get update
sudo apt-get install -y imagemagick webp

# Convert manually
convert "buibui-theme/static/assets/img/20260129_052137(1).jpg" \
    -resize 1920x \
    -quality 85 \
    -define webp:method=6 \
    buibui-theme/static/assets/img/hero-image.webp
```

### Check File Size

```bash
# Before
ls -lh "buibui-theme/static/assets/img/20260129_052137(1).jpg"

# After
ls -lh buibui-theme/static/assets/img/hero-image.webp

# Should see 90-95% size reduction
```

## Alternative: Use Existing Image

If you prefer to use the daytime photo that's already optimized:

```bash
# The current hero-image.webp is already the daytime team photo
# No changes needed - it's already optimized and working
```

## Questions?

The evening photo requires:
- Darker overlay (✅ already set to 60%)
- White text (✅ already configured)
- Enhanced shadows (✅ already applied)

All CSS is ready - just need the image file uploaded!
