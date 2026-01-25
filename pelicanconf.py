AUTHOR = 'GlenStriders'
SITENAME = 'GlenStriders | GlenStriders Running Club '
SITEURL = "https://glenstriders.co.zw"

PATH = "content"

TIMEZONE = 'Africa/Harare'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (
    ("Pelican", "https://getpelican.com/"),
    ("Python.org", "https://www.python.org/"),
    ("Jinja2", "https://palletsprojects.com/p/jinja/"),
    ("You can modify those links in your config file", "#"),
)

# Social widget
SOCIAL = (
    ("facebook", "https://www.facebook.com/glenstriders"),
    ("youtube", "https://www.youtube.com/@glenstriders"),
    ("tiktok", "https://www.tiktok.com/@glenstriders"),
    ("twitter-x", "https://x.com/glenstriders"),
    ("strava", "https://www.strava.com/clubs/1275990"),
)

DEFAULT_PAGINATION = 10

# Use absolute URLs for proper Open Graph and Twitter Card meta tags
# Social media platforms require absolute URLs to display images correctly
RELATIVE_URLS = False

# Page URL configuration - serve pages on root instead of pages/ subdirectory
PAGE_URL = '{slug}.html'
PAGE_SAVE_AS = '{slug}.html'

# Blog/Archives URL configuration - save archives as blog.html
ARCHIVES_SAVE_AS = 'blog.html'

# MENUITEMS = [
#     ("Home", ""),
#     ("Services", ""),
#     ("Contact Us", ""),
#     ]

THEME = "buibui-theme"

CSS_FILE = "styles.css"

# Scout Template Configuration

# Hero section
HERO_TAG = ""
HEROTEXT = "Welcome To Glen Striders Running Club"
HERO_CTA_BUTTON_TEXT = "Join Us"
HERO_CTA_LINK = "membership.html"
HEROSUBTEXT = "Established on the principles of community spirit, Glen Striders is home to runners of all levels. Whether you're taking your first step or training for your tenth marathon, you'll find a supportive team to help you reach the finish line."

# Optional hero features list
# HERO_FEATURES = [
#     "Community of passionate runners",
#     "Regular training sessions",
#     "Social events and races"
# ]

# Footer configuration
FOOTER_ADDRESS = ""
FOOTER_PHONE = ""
FOOTER_EMAIL = ""

# Sitemap Configuration
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
