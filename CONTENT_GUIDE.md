# Content Management with Pelican

This project uses [Pelican](https://getpelican.com/), a static site generator, to manage content. All content is written in Markdown or reStructuredText format and stored in the `content/` directory.

## Content Structure

```
content/
├── pages/              # Static pages (About, Events, Membership, etc.)
│   ├── events.md
│   ├── membership.md
│   └── shop.md
└── *.md               # Blog posts/articles
```

## Writing Content

### Creating a New Blog Post

1. Create a new `.md` file in the `content/` directory
2. Add metadata at the top of the file:

```markdown
Title: Your Post Title
Date: 2024-12-01 10:00
Category: News
Tags: running, events
Summary: A brief summary of your post

Your content goes here...
```

### Creating a New Page

1. Create a new `.md` file in the `content/pages/` directory
2. Add metadata at the top of the file:

```markdown
Title: Page Title
Date: 2024-12-01
Slug: page-url
Status: published

Your page content goes here...
```

### Using Custom Templates

Some pages use custom templates for special layouts:

```markdown
Title: Events
Date: 2024-12-31
Slug: events
Template: page_events
Status: published
```

Available custom templates:
- `page_events` - Events calendar with interactive month navigation
- `page_membership` - Membership information with pricing cards
- `page_shop` - Shop page with product listings

## Managing Events Data

Events are stored in a JSON file that can be easily edited:

**File:** `buibui-theme/static/data/events-2026.json`

The JSON structure is:
```json
[
  {
    "date": "2026-01-03",
    "day": "Saturday",
    "race": "Event Name",
    "venue": "Location"
  }
]
```

To update events:
1. Edit `buibui-theme/static/data/events-2026.json`
2. Add, remove, or modify events as needed
3. Rebuild the site with `make html`

## Building the Site

### Development Build
```bash
make html
```
This generates the site in the `output/` directory with relative URLs.

### Production Build
```bash
make publish
```
This uses production settings from `publishconf.py` with absolute URLs.

### Live Development Server
```bash
make devserver
```
This starts a local server at http://localhost:8000 and automatically rebuilds when you save changes.

To stop the dev server:
```bash
make stopserver
```

## Configuration

### Main Configuration: `pelicanconf.py`
- Site name, author, timezone
- Theme settings
- Plugin configuration
- Social media links
- Hero section content

### Production Configuration: `publishconf.py`
- Production site URL
- Feed generation
- Analytics settings

## Theme Customization

The site uses a custom theme in `buibui-theme/`:

```
buibui-theme/
├── static/
│   ├── css/           # Stylesheets
│   ├── js/            # JavaScript files
│   ├── img/           # Images
│   └── data/          # Data files (like events.json)
└── templates/         # Jinja2 templates
    ├── base.html      # Base template
    ├── index.html     # Homepage
    ├── page.html      # Default page template
    └── page_*.html    # Custom page templates
```

## Workflow

1. **Write content** in Markdown files in `content/` directory
2. **Build the site** with `make html` (development) or `make publish` (production)
3. **Preview locally** by opening `output/index.html` or running `make serve`
4. **Deploy** the contents of the `output/` directory to your web server

## Tips

- Use the existing pages as templates for new content
- Check the [Pelican documentation](https://docs.getpelican.com/) for advanced features
- Test your changes locally before deploying
- Keep your content organized with categories and tags
- Use descriptive slugs for better SEO

## Common Tasks

### Adding a New Menu Item

Edit `buibui-theme/templates/base.html` and add to the navigation section:

```html
<li><a href="{{ SITEURL }}/pages/your-page.html">Your Page</a></li>
```

### Changing Site Colors

Edit `buibui-theme/static/css/main.css` and modify the CSS variables.

### Adding Images

1. Place images in `content/images/` or `buibui-theme/static/img/`
2. Reference in content: `![Alt text]({static}/images/photo.jpg)`

## Support

For issues or questions about content management, refer to:
- [Pelican Documentation](https://docs.getpelican.com/)
- [Markdown Guide](https://www.markdownguide.org/)
