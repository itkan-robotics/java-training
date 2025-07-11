# Netlify Deployment Guide

This project is configured for optimal deployment on Netlify's static hosting platform.

## Quick Deploy

### Option 1: Git-Based Deployment (Recommended)
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Netlify
3. Netlify will automatically detect the configuration and deploy

### Option 2: Manual Deployment
1. Drag and drop the project folder to Netlify's deploy area
2. Site will be live with automatic HTTPS

## Configuration Files

### `_redirects`
- Handles SPA routing by redirecting all routes to `index.html`
- Ensures client-side routing works properly

### `netlify.toml`
- Build configuration
- Security headers
- Caching headers for static assets
- SPA routing configuration

### `404.html`
- Custom 404 page for better user experience
- Matches the site's design

## Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Or use the original development server
npm run serve

# Test Netlify functions locally
npm run netlify-dev
```

## Performance Optimizations

- Static assets are cached for 1 year
- Security headers are configured
- SPA routing is optimized
- SEO meta tags are included

## Environment Variables

If needed, configure environment variables in Netlify's dashboard:
- Go to Site settings > Environment variables
- Add any required variables

## Custom Domain

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Monitoring

- Check Netlify's built-in analytics
- Monitor performance with PageSpeed Insights
- Review security headers with securityheaders.com

## Troubleshooting

### Common Issues:
1. **Routes not working**: Ensure `_redirects` file is in the root directory
2. **Assets not loading**: Check file paths are relative to root
3. **Build failures**: Verify `netlify.toml` configuration

### Support:
- Check Netlify's documentation: https://docs.netlify.com/
- Review build logs in Netlify dashboard
- Test locally with `npm run dev`

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All routes work (test navigation)
- [ ] Assets load properly
- [ ] HTTPS is working
- [ ] Custom domain configured (if applicable)
- [ ] Performance is acceptable
- [ ] SEO meta tags are working 