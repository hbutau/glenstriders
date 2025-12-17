# Sitemap Configuration for Google Search Console

This project automatically generates a sitemap for Google Search Console using the `pelican-sitemap` plugin.

## What is a Sitemap?

A sitemap is an XML file that lists all the important pages on your website, helping search engines like Google discover and index your content more efficiently.

## Configuration

The sitemap is configured in `pelicanconf.py` with the following settings:

```python
PLUGINS = ['pelican.plugins.sitemap']

SITEMAP = {
    'format': 'xml',
    'priorities': {
        'articles': 0.5,
        'indexes': 0.5,
        'pages': 0.5
    },
    'changefreqs': {
        'articles': 'monthly',
        'indexes': 'daily',
        'pages': 'monthly'
    }
}
```

## Generating the Sitemap

### For Development (with relative URLs)
```bash
make html
```
This generates the site with relative URLs in `output/sitemap.xml`.

### For Production (with absolute URLs)
```bash
make publish
```
This uses `publishconf.py` which should have your production `SITEURL` configured.

**Important:** Before running `make publish`, update `publishconf.py` with your actual domain:
```python
SITEURL = "https://www.glenstriders.com"  # Replace with your actual domain
```

## Generated Files

After building, the sitemap will be available at:
- Local: `output/sitemap.xml`
- Production: `https://yourdomain.com/sitemap.xml`

## Submitting to Google Search Console

1. Build your site for production: `make publish`
2. Deploy your site (the sitemap.xml will be in the output directory)
3. Go to [Google Search Console](https://search.google.com/search-console/)
4. Add your property (your website)
5. Navigate to "Sitemaps" in the left menu
6. Submit your sitemap URL: `https://yourdomain.com/sitemap.xml`

## Sitemap Contents

The sitemap automatically includes:
- Homepage
- All articles/blog posts
- All pages (membership, shop, etc.)
- Archive pages
- Category pages
- Author pages
- Tag pages

## Customizing the Sitemap

You can customize the sitemap behavior by modifying the `SITEMAP` configuration in `pelicanconf.py`:

- **priorities**: Set the relative importance of different page types (0.0 to 1.0)
- **changefreqs**: Set how often pages are expected to change (always, hourly, daily, weekly, monthly, yearly, never)

For more information, see the [pelican-sitemap documentation](https://github.com/pelican-plugins/sitemap).
