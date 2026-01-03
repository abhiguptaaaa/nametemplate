# How to Push Your Code to GitHub

Your code is ready and committed locally, but GitHub needs you to authenticate before accepting the upload.

## Option 1: Use GitHub Desktop (EASIEST)
1. Download and install [GitHub Desktop](https://desktop.github.com/)
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Browse to: `C:\Users\abhig\.gemini\antigravity\scratch\name-generator`
5. Click "Publish repository" button
6. It will automatically handle authentication and push everything

## Option 2: Use Personal Access Token
1. Go to GitHub.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "nametemplate"
4. Check the "repo" scope
5. Click "Generate token" and COPY the token (you won't see it again!)
6. In your terminal, run:
   ```powershell
   git push -u origin main
   ```
7. When it asks for username: enter your GitHub username
8. When it asks for password: paste the token (not your actual password!)

## Option 3: Use GitHub CLI
1. Install [GitHub CLI](https://cli.github.com/)
2. Run: `gh auth login`
3. Follow the prompts to authenticate
4. Then run: `git push -u origin main`

## Why This Is Needed
GitHub stopped accepting passwords for command-line operations in 2021. You must use one of these authentication methods.
