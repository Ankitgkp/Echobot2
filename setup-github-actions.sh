#!/bin/bash

# Quick setup script for GitHub Actions deployment
# Run this script to set up your repository for GitHub Actions

set -e

echo "🚀 Setting up Google Meet Bot for GitHub Actions..."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your credentials before proceeding."
    echo ""
    read -p "Press enter after you've updated .env file..."
fi

# Create .github/workflows directory
echo "📂 Creating GitHub Actions workflow directory..."
mkdir -p .github/workflows

# Check if workflow file exists
if [ ! -f .github/workflows/test-meet-bot.yml ]; then
    echo "⚠️  Workflow file not found in .github/workflows/"
    echo "Please make sure test-meet-bot.yml is in .github/workflows/"
    exit 1
fi

# Add all files
echo "➕ Adding files to git..."
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "ℹ️  No changes to commit."
else
    echo "💾 Committing changes..."
    git commit -m "Setup Google Meet Bot for GitHub Actions"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 No git remote found."
    echo "Please enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
    read repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No repository URL provided."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote 'origin' added: $repo_url"
fi

echo ""
echo "📤 Ready to push to GitHub?"
echo "This will push to the 'main' branch."
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check if main branch exists
    if ! git show-ref --verify --quiet refs/heads/main; then
        echo "🔀 Creating main branch..."
        git branch -M main
    fi
    
    echo "⬆️  Pushing to GitHub..."
    git push -u origin main
    
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to your GitHub repository"
    echo "2. Navigate to Settings → Secrets and variables → Actions"
    echo "3. Add the following secrets:"
    echo "   - EMAIL_ID: Your Google account email"
    echo "   - EMAIL_PASSWORD: Your Google account password (or App Password)"
    echo "   - MEET_LINK: (Optional) Default Google Meet link"
    echo ""
    echo "4. Go to Actions tab and run 'Test Google Meet Bot' workflow"
    echo ""
    echo "📖 For detailed instructions, see DEPLOYMENT.md"
else
    echo ""
    echo "ℹ️  Push cancelled. You can push manually later with:"
    echo "   git push -u origin main"
    echo ""
    echo "📋 Remember to add secrets in GitHub repository settings:"
    echo "   Settings → Secrets and variables → Actions"
fi

echo ""
echo "🎉 Setup complete!"