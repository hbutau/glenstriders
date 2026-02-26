# Stock Image Replacement - Next Steps

## Current Status

⚠️ **Network Access Limitation**: The sandbox environment cannot directly download images from external websites (Pexels, Unsplash, Pixabay, etc.) due to network restrictions.

## What's Been Prepared

✅ Created comprehensive guide: `ADD_STOCK_IMAGE_GUIDE.md`
✅ Documented recommended free stock image sources
✅ Provided specific image URLs and IDs
✅ Included optimization commands
✅ Blog post is ready to use the image once it's added

## To Complete This Task

You need to manually download and add a stock image. Here's the quickest way:

### Quick Method (5 minutes)

1. **Download a stock image**:
   - Visit: https://www.pexels.com/photo/group-of-people-running-on-stadium-3764370/
   - Click "Download" → Choose "Large" (1920x1280)
   - Save as `african-runners.jpg`

2. **Optimize and add to repository**:
   ```bash
   cd /home/runner/work/glenstriders/glenstriders
   
   # Optimize the downloaded image
   convert ~/Downloads/african-runners.jpg \
       -resize 1200x \
       -quality 85 \
       content/images/glen-striders-group.jpg
   
   # Verify the file size (should be ~150-300KB)
   ls -lh content/images/glen-striders-group.jpg
   
   # Build and test
   make html
   cd output && python3 -m http.server 8000
   ```

3. **Commit the changes**:
   ```bash
   cd /home/runner/work/glenstriders/glenstriders
   git add content/images/glen-striders-group.jpg
   git commit -m "Replace with free stock image of African runners from Pexels"
   git push origin copilot/add-blog-post-duathlon
   ```

## Recommended Images

All these are free to use commercially without attribution:

### Best Options:

1. **Pexels #3764370** (Recommended ⭐)
   - URL: https://www.pexels.com/photo/group-of-people-running-on-stadium-3764370/
   - Shows diverse runners in stadium
   - High quality, dynamic composition
   - Perfect for running club blog

2. **Pexels #2803158**
   - URL: https://www.pexels.com/photo/people-running-during-daytime-2803158/
   - Outdoor running scene
   - Great energy and movement

3. **Unsplash - Kenya Marathon**
   - Search: "kenya marathon" on Unsplash
   - Multiple professional photos available
   - Shows authentic African running scenes

## Current File Details

- **Path**: `content/images/glen-striders-group.jpg`
- **Current size**: 237KB (team photo)
- **Target size**: 150-300KB (optimized stock photo)
- **Required width**: 1200px
- **Used in**: `content/glenstriders-duathlon.md`

## Why This Approach?

The blog post metadata is already configured:
```markdown
Image: ./images/glen-striders-group.jpg
```

Simply replacing the file at `content/images/glen-striders-group.jpg` with a stock image will automatically update the blog post. No code changes needed!

## License Verification

All recommended sources (Pexels, Unsplash, Pixabay):
- ✅ Free for commercial use
- ✅ No attribution required
- ✅ Can be modified
- ✅ Can be redistributed
- ✅ Safe for website use

## Questions?

See the full guide in `ADD_STOCK_IMAGE_GUIDE.md` for more options and detailed instructions.
