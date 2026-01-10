# Glen Striders Website

A static website for Glen Striders Running Club, built with [Pelican](https://getpelican.com/).

## Quick Start

### Prerequisites
- Python 3.7+
- Pelican and dependencies (install with `pip install -r requirements.txt` or using Pipfile)

### Installation

```bash
# Clone the repository
git clone https://github.com/hbutau/glenstriders.git
cd glenstriders

# Install dependencies
pip install pelican markdown pelican-sitemap

# Or using Pipenv
pipenv install
```

### Building the Site

```bash
# Development build (with relative URLs)
make html

# Production build (with absolute URLs)
make publish

# Development server with auto-reload
make devserver

# View the site
# Open output/index.html in your browser
# Or visit http://localhost:8000 if using devserver
```

## Content Management

All content is managed using **Markdown files** in the `content/` directory. See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for detailed instructions.

### Quick Content Updates

#### Adding a Blog Post
Create a new `.md` file in `content/`:
```markdown
Title: Your Post Title
Date: 2024-12-01 10:00
Category: News

Your content here...
```

#### Updating Events
Edit `content/pages/events.md` and add/modify rows in the markdown table:
```markdown
| 2026-03-15 | Sunday | Event Name | Venue |
```

#### Updating Shop Products
Edit `content/pages/shop.md` and add/modify product sections:
```markdown
#### Product Name - $XX
Product description.

**Image:** filename.jpeg
```

#### Updating Pages
Edit the corresponding `.md` file in `content/pages/`:
- `content/pages/membership.md` - Membership information
- `content/pages/shop.md` - Shop/merchandise
- `content/pages/events.md` - Events calendar data

## Project Structure

```
.
├── content/              # Content files (Markdown)
│   ├── pages/           # Static pages
│   └── *.md             # Blog posts
├── buibui-theme/        # Custom Pelican theme
│   ├── static/          # CSS, JS, images, data files
│   └── templates/       # Jinja2 templates
├── output/              # Generated site (git-ignored)
├── pelicanconf.py       # Pelican configuration
├── publishconf.py       # Production configuration
└── Makefile             # Build commands
```

## Configuration

### Site Settings
Edit `pelicanconf.py` to customize:
- Site name and description
- Social media links
- Hero section content
- Theme settings

### Production Settings
Edit `publishconf.py` to set:
- Production site URL
- Analytics tracking
- Feed generation

## Deployment

After building with `make publish`, deploy the contents of the `output/` directory to your web server.

### Example deployment methods:
```bash
# SSH
make ssh_upload

# rsync
make rsync_upload

# GitHub Pages
make github
```

Configure SSH/rsync settings in the Makefile.

## Key Features

✅ **Content in Markdown** - All content written in Markdown format
✅ **Static Site** - Fast, secure, easy to deploy
✅ **Custom Theme** - Bootstrap-based responsive design
✅ **Events Calendar** - Interactive monthly event calendar
✅ **Blog Support** - Built-in blog with categories and tags
✅ **SEO Ready** - Sitemap generation, meta tags
✅ **Social Integration** - Links to Facebook, Twitter, YouTube, TikTok

## Documentation

- [CONTENT_GUIDE.md](CONTENT_GUIDE.md) - Comprehensive guide to managing content
- [SITEMAP.md](SITEMAP.md) - Sitemap configuration and Google Search Console setup
- [Pelican Documentation](https://docs.getpelican.com/) - Official Pelican docs

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `make devserver`
4. Submit a pull request

## License

This website is for Glen Striders Running Club.

Theme based on Scout Bootstrap template by [BootstrapMade](https://bootstrapmade.com/).
