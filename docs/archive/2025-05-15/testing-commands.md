---
title: Testing Infrastructure Setup - Commands to Run (Archived)
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header and moved to archive.
status: Deprecated
owner: [Primary Maintainer]
related_files: []
---

**Archival Note:** This document is an outdated checklist and has been moved to the archive. Refer to the main documentation for current information.

# Task 1.9: Testing Infrastructure Setup - Commands to Run

Please run the following commands in your terminal to set up the testing infrastructure:

**In the `client` directory:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev cypress cypress-localstorage-commands @cypress/code-coverage
```

**In the `server` directory:**

```bash
npm install --save-dev jest supertest
```

You will be instructed later in the work plan when to run these commands.

## Task 1.10: Security Enhancements

Please run the following command in your terminal within the `server` directory to install the necessary security dependencies:

```bash
npm install express-rate-limit helmet cors express-mongo-sanitize xss-clean
```

## Task 5.5: Add Monitoring and Error Tracking

Please run the following command in your terminal within the `client` directory to install the necessary monitoring dependencies:

```bash
npm install @sentry/react @sentry/tracing web-vitals
