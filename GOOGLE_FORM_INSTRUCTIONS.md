# How to Add the Google Form Embed Code

The membership page has been prepared with a placeholder for your Google Form. Follow these steps to add the actual form:

## Steps to Get Google Form Embed Code

1. **Open your Google Form** at https://docs.google.com/forms
2. **Click the "Send" button** in the top-right corner of the form
3. **Click the "Embed HTML" icon** (looks like `<>`)
4. **Copy the iframe code** that appears (it will look something like this):
   ```html
   <iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="640" height="1200" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
   ```

## Where to Add the Code

Open the file: `buibui-theme/templates/page_membership.html`

Find the placeholder section (around line 33-47) that looks like this:

```html
<div style="text-align: center; padding: 2rem; background: #f8f9fa; border-radius: 8px; border: 2px dashed #dee2e6;">
  <i class="bi bi-file-earmark-text" style="font-size: 3rem; color: var(--accent-color);"></i>
  <h4 class="mt-3 mb-2">Membership Application Form</h4>
  <p class="text-muted mb-3">The Google Form will be embedded here</p>
  <p class="small text-muted">
    <!-- Replace this placeholder with the actual Google Form embed code -->
    <!-- Example: <iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="100%" height="1200" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe> -->
  </p>
  <div class="alert alert-info mt-3">
    <strong>Note:</strong> To add your Google Form here, replace this placeholder with your form's embed code. 
    Get the embed code from Google Forms by clicking "Send" → "Embed HTML" icon.
  </div>
</div>
```

Replace the **entire `<div>` section above** with just your iframe code, making sure to set:
- `width="100%"` (instead of the default 640)
- `height="1200"` or adjust based on your form's length

## Example Replacement

Replace the entire placeholder div with:

```html
<iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" 
        width="100%" 
        height="1200" 
        frameborder="0" 
        marginheight="0" 
        marginwidth="0"
        style="border-radius: 8px;">
  Loading…
</iframe>
```

## After Adding the Form

1. **Rebuild the site**: Run `make html` in the repository root
2. **Test locally**: Run `make devserver` and visit `http://localhost:8000/membership.html`
3. **Verify the form**: Make sure the form displays correctly and is easy to use
4. **Commit your changes**: 
   ```bash
   git add buibui-theme/templates/page_membership.html
   git commit -m "Add Google Form embed code to membership page"
   git push
   ```

## Troubleshooting

- **Form is too small**: Increase the `height` attribute in the iframe (try 1400, 1600, etc.)
- **Form doesn't fit on mobile**: The width is set to 100% which should be responsive
- **Form doesn't load**: Check that the Google Form is set to "Accept responses" and not restricted to your organization only

## Need Help?

If you encounter any issues, please reach out to your web developer or check Google's documentation on embedding forms.
