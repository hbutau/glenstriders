# Strava Embed Update Guide

## Current Status
The Strava activities section on the homepage currently shows a fallback link to the club page instead of an embedded activity feed widget.

## How to Enable the Activity Feed Embed

To display the live Strava activity feed on your website, you need to obtain a fresh embed token from Strava:

### Steps to Get the Embed Code:

1. **Log into Strava.com** with a Glen Striders club admin account

2. **Navigate to your club page**:
   - Go to https://www.strava.com/clubs/1251058

3. **Access Club Settings**:
   - Click the "Manage Club" button (only visible to club admins)

4. **Get the Embed Widget**:
   - Go to the "Promote" tab in club settings
   - Look for the "Club Widget" or "Embed" section
   - Copy the iframe embed code provided by Strava

5. **Update the Website**:
   - Open the file: `buibui-theme/templates/base.html`
   - Find the section with id `strava-activities` (around line 220)
   - Replace the current fallback content with the iframe code from Strava
   - The embed code should look like this:
   ```html
   <iframe height='454' width='300' frameborder='0' allowtransparency='true' 
       scrolling='no' src='https://www.strava.com/clubs/1251058/latest-rides/[NEW_EMBED_TOKEN]'
       title='Strava Club Activities' aria-label='Weekly club activities from Strava'>
   </iframe>
   ```

6. **Rebuild and Deploy**:
   ```bash
   make html
   make publish
   ```

### Important Notes:

- **Do NOT add query parameters** (like `?show_rides=10`) to the embed URL - Strava's current embed system doesn't support them
- The embed token is a unique hash that Strava generates for your club
- Tokens may expire or become invalid over time - if the embed stops working, regenerate a new token following these steps
- The iframe dimensions (height and width) can be adjusted based on your design preferences

### Troubleshooting:

**If the embed doesn't work after updating:**
- Verify you copied the complete iframe code from Strava
- Check that the club ID (1251058) is correct
- Ensure there are no extra query parameters in the URL
- Try regenerating the embed token from the Strava club settings
- Contact Strava support if the embed feature appears unavailable

**If you don't have admin access:**
- Contact the club owner or another admin who can access the "Manage Club" section
- Request they provide you with the embed code

### Alternative Options:

If the Strava embed widget is not available or not working properly:
- Keep the current fallback design (link to club page)
- Use a Strava club badge instead of the activity feed
- Manually update with links to recent activities
- Consider using Strava's API (requires development work)

## File Location

The Strava section is located in:
- **Template**: `buibui-theme/templates/base.html`
- **Section ID**: `strava-activities`
- **Line**: Approximately line 209-238

## Support

For questions or issues:
- Check Strava's official embed documentation: https://support.strava.com/hc/en-us/articles/216918527
- Contact Strava support for embed-specific issues
- Review this repository's documentation for general website updates
