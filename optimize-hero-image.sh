#!/bin/bash
# Script to optimize the hero image for web use
# Usage: ./optimize-hero-image.sh path/to/source-image.jpg

if [ $# -eq 0 ]; then
    echo "Usage: $0 <source-image.jpg>"
    echo "Example: $0 buibui-theme/static/assets/img/20260129_052137(1).jpg"
    exit 1
fi

SOURCE_IMAGE="$1"
OUTPUT_IMAGE="buibui-theme/static/assets/img/hero-image.webp"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "Error: Source image not found: $SOURCE_IMAGE"
    exit 1
fi

echo "Optimizing $SOURCE_IMAGE..."
echo "Output: $OUTPUT_IMAGE"

# Install ImageMagick if not available
if ! command -v convert &> /dev/null; then
    echo "Installing ImageMagick..."
    sudo apt-get update -qq
    sudo apt-get install -y imagemagick webp
fi

# Get source image dimensions
echo "Source image info:"
identify "$SOURCE_IMAGE" 2>/dev/null || file "$SOURCE_IMAGE"

# Convert to WebP with optimization
# - Resize to max width 1920px while maintaining aspect ratio
# - Quality 85 for good balance between size and quality
# - WebP method 6 for best compression
convert "$SOURCE_IMAGE" \
    -resize 1920x \
    -quality 85 \
    -define webp:method=6 \
    "$OUTPUT_IMAGE"

echo ""
echo "Optimization complete!"
echo "Original size: $(du -h "$SOURCE_IMAGE" | cut -f1)"
echo "Optimized size: $(du -h "$OUTPUT_IMAGE" | cut -f1)"
echo ""
echo "New image saved to: $OUTPUT_IMAGE"
