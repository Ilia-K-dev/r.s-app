# Contributing to Receipt Scanner

## Frontend Development Workflow

### Testing Without Local Builds

We use Firebase Hosting Preview Channels to test frontend changes without requiring local builds.

When you push changes to any branch:
1. GitHub Actions automatically builds and deploys your frontend code
2. A unique preview URL is generated where anyone can test the changes
3. For pull requests, this URL appears in the PR comments

### Development Process

1. Create a new branch for your task:
   ```bash
   git checkout -b task/your-task-name
   ```

2. Make your changes to files in the client/ directory
3. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Task: Description of your changes"
   git push origin task/your-task-name
   ```

4. Create a pull request on GitHub
5. After the automatic deployment completes, use the preview URL to test your changes
6. Continue to make changes as needed - each push updates the preview
7. Once the preview is working correctly, the PR can be reviewed and merged


### Step 4: Test the Setup
1. Create a small test change to verify the workflow:
   - Create a branch: `git checkout -b test/preview-deployment`
   - Make a small visible change to `client/src/App.js` (add a version number or timestamp)
   - Commit and push: `git add . && git commit -m "Test: Preview deployment" && git push origin test/preview-deployment`
   - Create a PR on GitHub
   - Verify the GitHub Action runs and creates a preview URL
   - Test the preview URL to confirm it works

### Step 5: Document the Process in `implementation-tasks.md`
1. Add a section to `implementation-tasks.md` documenting:
   - The Firebase Preview setup completed
   - How to use the preview URLs for testing
   - Any issues encountered and how they were resolved

## Deliverables
1. Working GitHub Actions workflow for Firebase Preview Channels
2. Updated Firebase configuration files
3. CONTRIBUTING.md guide explaining the workflow
4. Successful test deployment with a working preview URL
5. Documentation in implementation-tasks.md

## Testing and Verification
After pushing your changes, verify:
1. The GitHub Action runs successfully
2. A preview URL is generated and appears in the PR comments
3. The preview URL loads the frontend correctly in a browser
4. Any changes to the client code are reflected in the preview after pushing

## Notes
- The Firebase project (project-reciept-reader-id) should already be set up
- You may need to coordinate with the repository admin to add the FIREBASE_SERVICE_ACCOUNT secret to GitHub
