---
title: "How to Update Documentation"
creation_date: 2025-05-16 23:28:57
update_history:
  - date: 2025-05-16 23:28:57
    description: Initial creation.
status: Draft
owner: Cline EDI Assistant
related_files:
  - ../documentation-update-process.md
  - ../../templates/template-usage-guide.md
  - ../../development/documentation-change-template.md
---

# How to Update Documentation

[Home](/docs) > [Guides](/docs/guides) > [Training](./) > How to Update Documentation

## In This Document
- [Overview](#overview)
- [When to Update Documentation](#when-to-update-documentation)
- [The Documentation Update Workflow](#the-documentation-update-workflow)
- [Using Documentation Templates](#using-documentation-templates)
- [Writing Clear and Concise Content](#writing-clear-and-concise-content)
- [Including Code Examples and Diagrams](#including-code-examples-and-diagrams)
- [The Documentation Review Process](#the-documentation-review-process)
- [Related Documents](#related-documents)

## Related Documentation
- [Documentation Update Process Guide](../documentation-update-process.md)
- [Documentation Template Usage Guide](../../templates/template-usage-guide.md)
- [Documentation Change Template](../../development/documentation-change-template.md)

## Overview

Maintaining accurate and up-to-date documentation is a shared responsibility. This guide outlines the process for updating the Receipt Scanner application's documentation.

## When to Update Documentation

Documentation should be updated whenever:

-   A new feature is implemented.
-   An existing feature is significantly changed.
-   A bug is fixed that requires clarifying existing documentation or adding troubleshooting steps.
-   An architectural change is made.
-   API endpoints are added, modified, or removed.
-   Security updates are implemented.
-   Any other change is made that affects how developers or users interact with the application or its codebase.

Refer to the [Documentation Update Process Guide](../documentation-update-process.md) for more details on trigger events.

## The Documentation Update Workflow

The process for updating documentation is integrated into the standard development workflow. Generally, it involves:

1.  Identifying the documentation that needs to be updated based on the code changes.
2.  Making the necessary changes to the documentation files.
3.  Including the documentation changes in your pull request.
4.  Ensuring the documentation changes are reviewed as part of the code review process.

Refer to the [Development Process Workflow Guide](../development-process-workflow.md) for the overall development workflow.

## Using Documentation Templates

When creating new documentation or significantly restructuring existing content, use the predefined documentation templates located in `/docs/templates/`. These templates provide a consistent structure and ensure all necessary sections are included.

Refer to the [Documentation Template Usage Guide](../../templates/template-usage-guide.md) for instructions on how to use the templates.

## Writing Clear and Concise Content

-   Use clear and simple language.
-   Organize information logically with headings and subheadings.
-   Use bullet points and lists for readability.
-   Be accurate and specific in your descriptions.
-   Proofread your content for errors.

## Including Code Examples and Diagrams

Where appropriate, include code examples and diagrams to illustrate concepts and processes. Ensure code examples are correct and diagrams are clear and easy to understand.

## The Documentation Review Process

Documentation changes are reviewed as part of the code review process. Reviewers will use the [Documentation Review Checklist](../../development/documentation-review-checklist.md) to evaluate your changes. Ensure your documentation meets the criteria outlined in the checklist before submitting your pull request.
