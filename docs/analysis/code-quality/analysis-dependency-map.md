---
title: "Dependency Map"
creation_date: 2025-05-16
update_history:
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: Completed
owner: Cline EDI Assistant
related_files:
  - client/package.json
  - server/package.json
  - functions/package.json
---

# Dependency Map

[Home](/docs) > [Analysis Documentation](/docs/analysis) > [Code Quality Analysis](/docs/analysis/code-quality) > Dependency Map

## In This Document
- [Client Dependencies (`client/package.json`)](#client-dependencies-clientpackagejson)
  - [Dependencies](#dependencies)
  - [Dev Dependencies](#dev-dependencies)
- [Server Dependencies (`server/package.json`)](#server-dependencies-serverpackagejson)
  - [Dependencies](#dependencies-1)
  - [Dev Dependencies](#dev-dependencies-1)
- [Functions Dependencies (`functions/package.json`)](#functions-dependencies-functionspackagejson)
  - [Dependencies](#dependencies-2)
  - [Dev Dependencies](#dev-dependencies-2)
- [Dependency Relationships and Observations](#dependency-relationships-and-observations)

## Related Documentation
- [client/package.json](client/package.json)
- [server/package.json](server/package.json)
- [functions/package.json](functions/package.json)

This document outlines the dependencies and their relationships within the Receipt Scanner application, based on the `package.json` files in the `client/`, `server/`, and `functions/` directories.

## Client Dependencies (`client/package.json`)

### Dependencies

*   `@babel/plugin-transform-async-generator-functions`: Babel plugin for transforming async generator functions.
*   `@babel/plugin-transform-class-properties`: Babel plugin for transforming class properties.
*   `@babel/plugin-transform-export-namespace-from`: Babel plugin for transforming export namespace from.
*   `@babel/plugin-transform-nullish-coalescing-operator`: Babel plugin for transforming nullish coalescing operator.
*   `@babel/plugin-transform-numeric-separator`: Babel plugin for transforming numeric separator.
*   `@babel/plugin-transform-object-rest-spread`: Babel plugin for transforming object rest spread.
*   `@babel/plugin-transform-optional-catch-binding`: Babel plugin for transforming optional catch binding.
*   `@babel/plugin-transform-optional-chaining`: Babel plugin for transforming optional chaining.
*   `@headlessui/react`: Headless UI components for React.
*   `@heroicons/react`: Heroicons for React.
*   `@react-navigation/native`: React Navigation core library.
*   `@react-navigation/stack`: Stack navigator for React Navigation.
*   `autoprefixer`: PostCSS plugin to parse CSS and add vendor prefixes.
*   `axios`: Promise-based HTTP client.
*   `chart.js`: Flexible JavaScript charting library.
*   `date-fns`: Modern JavaScript date utility library.
*   `firebase`: Firebase JavaScript SDK.
*   `lucide-react`: Lucide icons for React.
*   `postcss`: Tool for transforming CSS with JavaScript.
*   `react`: JavaScript library for building user interfaces.
*   `react-chartjs-2`: React wrapper for Chart.js.
*   `react-dom`: React package for working with the browser DOM.
*   `react-dropzone`: Simple React hook to create a HTML5 drag'n'drop zone for files.
*   `react-native`: Framework for building native apps with React.
*   `react-native-chart-kit`: React Native Chart Kit.
*   `react-native-fs`: React Native file system.
*   `react-native-gesture-handler`: Declarative API for handling gestures in React Native.
*   `react-native-reanimated`: React Native Reanimated.
*   `react-native-safe-area-context`: React Native Safe Area Context.
*   `react-native-screens`: React Native Screens.
*   `react-native-svg`: React Native SVG.
*   `react-native-vision-camera`: The Camera library for React Native.
*   `react-native-web`: Run React Native components and APIs on the web.
*   `react-router-dom`: DOM bindings for React Router.
*   `react-virtualized-auto-sizer`: React component that automatically adjusts the dimensions of a child.
*   `react-window`: React components for efficiently rendering large lists and tabular data.
*   `recharts`: Redefined chart library built with React and D3.
*   `tailwindcss`: Utility-first CSS framework.
*   `tesseract.js`: Pure JavaScript OCR for 100+ languages.
*   `uuid`: RFC-compliant UUID generator.

### Dev Dependencies

*   `@babel/core`: Babel compiler core.
*   `@babel/preset-env`: Babel preset for compiling modern JavaScript.
*   `@babel/runtime`: Babel runtime.
*   `@types/react`: TypeScript type definitions for React.
*   `babel-loader`: Babel webpack loader.
*   `babel-plugin-module-resolver`: Custom module resolver for Babel.
*   `typescript`: TypeScript language.

## Server Dependencies (`server/package.json`)

### Dependencies

*   `@google-cloud/vision`: Google Cloud Vision API client library.
*   `@sendgrid/mail`: SendGrid Node.js library.
*   `@types/sharp`: TypeScript type definitions for Sharp.
*   `axios`: Promise-based HTTP client.
*   `body-parser`: Node.js body parsing middleware.
*   `cors`: Connect/Express middleware to enable CORS.
*   `dotenv`: Loads environment variables from a `.env` file.
*   `express`: Fast, unopinionated, minimalist web framework for Node.js.
*   `express-rate-limit`: Basic rate-limiting middleware for Express.
*   `express-validator`: Express middleware for running validations.
*   `firebase-admin`: Firebase Admin SDK for Node.js.
*   `form-data`: A module to create readable `multipart/form-data` streams.
*   `helmet`: Helps secure Express apps with various HTTP headers.
*   `module-alias`: Create aliases to require modules.
*   `morgan`: HTTP request logger middleware for Node.js.
*   `multer`: Node.js middleware for handling `multipart/form-data`.
*   `papaparse`: Fast and powerful CSV parser for JavaScript.
*   `sharp`: High performance Node.js image processing.
*   `winston`: A logger for just about everything.

### Dev Dependencies

*   `@firebase/testing`: Firebase Testing.
*   `@types/cors`: TypeScript type definitions for Cors.
*   `@types/express`: TypeScript type definitions for Express.
*   `@types/morgan`: TypeScript type definitions for Morgan.
*   `@types/multer`: TypeScript type definitions for Multer.
*   `@types/node`: TypeScript type definitions for Node.js.
*   `@types/papaparse`: TypeScript type definitions for Papaparse.
*   `jest`: JavaScript testing framework.
*   `nodemon`: Monitor for changes in your node.js app and automatically restart the server.
*   `rimraf`: A `rm -rf` command for Node.js.
*   `ts-node`: TypeScript execution environment for Node.js.
*   `typescript`: TypeScript language.

## Functions Dependencies (`functions/package.json`)

### Dependencies

*   `@google-cloud/vision`: Google Cloud Vision API client library.
*   `firebase-admin`: Firebase Admin SDK for Node.js.
*   `firebase-functions`: Firebase Functions SDK.

### Dev Dependencies

*   `eslint`: Pluggable JavaScript linter.
*   `eslint-config-google`: ESLint config for Google's JavaScript style guide.
*   `firebase-functions-test`: Firebase Functions Test SDK.

## Dependency Relationships and Observations

*   **Firebase:** Used across all three components (client, server, functions) for various services (authentication, database, storage, cloud functions). This indicates a strong reliance on the Firebase platform.
*   **Google Cloud Vision:** Used in both the server and functions, likely for the OCR and document processing features.
*   **Axios:** Used in both the client and server for making HTTP requests.
*   **TypeScript:** Used in both the client and server for type checking and improved code maintainability.
*   **React and React Native:** Core frontend libraries used in the client.
*   **Express:** Core backend framework used in the server.
*   **Testing Frameworks:** Jest is used for testing in the server, and `@firebase/testing` and `firebase-functions-test` are used for Firebase-specific testing.
*   **Utility Libraries:** Various utility libraries are used across the components for tasks like date manipulation (`date-fns`), UUID generation (`uuid`), file system operations (`react-native-fs`), image processing (`sharp`), and CSV parsing (`papaparse`).
*   **UI Libraries:** The client uses `@headlessui/react`, `@heroicons/react`, `lucide-react`, and `tailwindcss` for UI components and styling.
*   **Charting Libraries:** The client uses `chart.js`, `react-chartjs-2`, `react-native-chart-kit`, and `recharts` for data visualization. This suggests multiple charting libraries are being used, which might be an area for potential consolidation.
*   **Module Aliasing:** The server uses `module-alias`, which can help with organizing imports but also adds a layer of abstraction.
*   **Environment Variables:** `dotenv` is used in the server for managing environment variables.

This dependency map provides a high-level overview of the external libraries and frameworks used in the Receipt Scanner application. A deeper analysis could involve examining how these dependencies are used within the code and identifying potential areas for optimization or refactoring.
