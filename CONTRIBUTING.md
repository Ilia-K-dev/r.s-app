# Contributing to Receipt Scanner

## Frontend Development Workflow

### Cloud-Only Development Approach

We use a cloud-only development approach with GitHub Actions and Firebase Preview Channels. 
**DO NOT attempt local builds** which will fail due to environment restrictions.

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

   The URL will be posted in the PR comments
   This URL contains a fully functional version of the app


6. Continue to make changes as needed - each push updates the preview
7. Once the preview is working correctly, the PR can be reviewed and merged


## Documentation Standards
For each task you work on:

1. Document all file changes with header comments:
   ```javascript
   /**
    * [Filename]
    * Last Modified: [Date] [Time]
    * Modified By: Cline
    * 
    * Purpose: [Brief description of what this file does]
    * Changes Made: [Summary of changes implemented]
    * Reasoning: [Why these changes were necessary]
    */
   ```

2. Update implementation-tasks.md with:
   - Files modified
   - Changes implemented
   - Testing performed
   - Issues encountered and solutions
   - Verification steps
