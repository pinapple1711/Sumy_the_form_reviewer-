# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project turns n8n workflows into a web application. n8n serves as the backend automation engine, while a vanilla HTML/CSS/JS frontend acts as the user-facing dashboard. The frontend triggers workflows via webhooks and displays the results.

- **Backend**: n8n (self-hosted or cloud) exposes webhook endpoints and executes workflows.
- **Frontend**: Vanilla HTML/CSS/JS served as static files.
- **Communication**: Frontend sends `POST`/`GET` requests to n8n webhook URLs; n8n processes the request and returns JSON.
- **AI Integration**: Uses `n8n-mcp` (Model Context Protocol) to enable AI-assisted workflow design, validation, and management.

## Development Commands

Serve the frontend locally during development:

```bash
# Option 1: Python HTTP server
python -m http.server 8080

# Option 2: Node.js serve
npx serve .
```

Open `http://localhost:8080` in your browser.

There is no build step for the vanilla stack. If you later add a bundler (e.g., Vite), document the build/dev commands here.

## Architecture

### Webhook Flow
1. The user interacts with the frontend dashboard (e.g., clicks a button, submits a form).
2. The frontend makes an HTTP request to an n8n webhook URL.
3. n8n receives the payload under `$json.body`, executes the workflow, and returns a response.
4. The frontend receives the response and updates the UI.

### MCP Integration (n8n-mcp)
This project integrates with [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) to enable AI-driven workflow operations:

- **Core utilities**: Search nodes, lookup properties, discover templates, validate configurations.
- **Management utilities**: Create/modify workflows, test executions, manage credentials, run security audits.
- **Setup**: Requires `N8N_API_URL` and `N8N_API_KEY` in your environment.

**Critical rule**: NEVER edit production workflows directly with AI. Always clone workflows first and test changes in a development environment.

### Security
- Store n8n webhook URLs, API keys, and MCP credentials in `.env`. Do not commit `.env`.
- For public webhooks, add authentication headers or tokens within the workflow.
- Use the n8n API key for management operations (MCP), not for webhook triggers.

## File Structure

```
.
├── index.html          # Main dashboard page
├── css/
│   └── style.css       # Dashboard styles
├── js/
│   ├── app.js          # Frontend logic and webhook calls
│   └── config.js       # Runtime configuration (gitignored)
├── .env.example        # Example environment variables
├── .gitignore          # Ignores .env, config.js, and local server artifacts
└── README.md           # Human-facing project documentation
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Example `.env`:
```env
# Webhook communication
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/your-webhook-id

# Management API (for MCP and administrative tasks)
N8N_API_URL=https://your-n8n-instance/api/v1
N8N_API_KEY=your-n8n-api-key
```

The frontend should load these via `js/config.js` (gitignored) if no bundler is used. Do not hardcode secrets in `app.js`.

## n8n Workflow Best Practices

When building or modifying workflows (especially via MCP):

1. **Webhook data location**: Incoming webhook data is under `$json.body`, not at the root.
2. **Expressions**: Use n8n expression syntax `{{}}` to reference data. Example: `{{$json.body.email}}`.
3. **Code nodes**: Prefer JavaScript for 95% of use cases. Python is available but adds overhead.
4. **Default parameters**: Explicitly configure every behavioral setting. Default parameters are the #1 source of runtime failures.
5. **Validation**: Always validate workflow configurations before deploying. Use MCP validation tools to check for errors.
6. **Testing**: Test workflows thoroughly in a development environment before promoting to production.

## Git & GitHub

Initialize and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: n8n dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Ensure `.env` and `js/config.js` are listed in `.gitignore`.

## Testing Webhooks Locally

If n8n is running locally (default port `5678`):
- Webhook URL: `http://localhost:5678/webhook/<id>`
- API URL: `http://localhost:5678/api/v1`

When testing across devices, expose n8n via a tunnel (e.g., ngrok) so the frontend can reach it.

## Deployment

### GitHub

Push the repository to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: n8n dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Ensure `.env` and `js/config.js` are listed in `.gitignore`.

### Vercel

Deploy the frontend to Vercel:

1. Import the project from GitHub in the Vercel dashboard.
2. **Framework Preset:** Choose `Other` (static).
3. **Build Command:** Leave empty (no build step for vanilla HTML/CSS/JS).
4. **Output Directory:** Set to `.` (root), or leave as default if it points to root.
5. **Environment Variables:** None needed for the frontend (all config is in `js/config.js`).
6. Click **Deploy**.

After deployment, update `js/config.js` to point to the public n8n webhook URL instead of `localhost`, then push again:

```javascript
// js/config.js
window.CONFIG = {
  STATS_WEBHOOK_URL: 'https://your-n8n-domain.com/webhook/sumy-stats'
};
```

Vercel will auto-redeploy on every push to the default branch.

## Resources

- [n8n-mcp](https://github.com/czlonkowski/n8n-mcp): MCP server for AI-powered n8n workflow management.
- [n8n-skills](https://github.com/czlonkowski/n8n-skills): Claude Code skills for building n8n workflows with MCP.
- [n8n Documentation](https://docs.n8n.io/): Official n8n docs for nodes, expressions, and webhooks.
