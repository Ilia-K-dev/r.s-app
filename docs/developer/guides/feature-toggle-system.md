# Feature Toggle System

## Introduction

The feature toggle system in the Receipt Scanner application is designed to provide a safe and controlled way to introduce, manage, and eventually remove features, particularly during the migration to direct Firebase integration. It allows for features to be enabled or disabled dynamically without requiring code deployments.

## Purpose

- **Safe Rollout:** Gradually enable new features for specific user segments or environments.
- **Emergency Fallback:** Quickly disable features in production if issues arise.
- **A/B Testing:** Compare different implementations of a feature.
- **Performance Monitoring:** Track the impact of features on application performance.
- **Controlled Migration:** Manage the transition from the Express backend to direct Firebase integration on a per-feature basis.

## Implementation Details

The feature flag system is implemented primarily in `client/src/core/config/featureFlags.js`.

- **Persistence:** Feature flag states are persistently stored in the browser's **IndexedDB** using the `idb` library. This ensures that flag states are preserved across browser sessions.
  - Database Name: `featureFlagsDB`
  - Object Store Name: `flags`
  - Key for Flags: `currentFlags`

- **Synchronization:** Changes to feature flags in one browser tab or window are automatically synchronized to other open tabs/windows using a **localStorage signaling mechanism**. When a flag is saved to IndexedDB, a timestamp is written to a specific localStorage key (`featureFlagsChangeSignal`), triggering a `storage` event in other tabs. The event listener then reloads the flags from IndexedDB.

- **Versioning:** A simple version number (`DB_VERSION`) is stored along with the flags in IndexedDB. This provides a basic mechanism for tracking the structure of the stored data and can be used for future data migrations if the storage format changes.

- **Auditing:** Each time the feature flags are saved, an audit entry is stored including a **timestamp** and a placeholder `userId`. This allows tracking when and by whom (in an authenticated context) feature flags were changed. *Note: The current implementation in `FeatureToggles.js` only displays the last audit entry. A full audit log would require a separate IndexedDB object store.*

## Usage

### Checking Feature Flag State

Use the `isFeatureEnabled` function to check if a feature is enabled:

```javascript
import { isFeatureEnabled } from '../../../core/config/featureFlags';

if (isFeatureEnabled('firebaseDirectIntegration')) {
  // Use Firebase direct integration
} else {
  // Use the fallback API
}
```

### Enabling/Disabling Feature Flags

Use the `enableFeature` and `disableFeature` functions to change the state of a feature flag. These functions update both the in-memory cache and the persistent storage (IndexedDB).

```javascript
import { enableFeature, disableFeature } from '../../../core/config/featureFlags';

// To enable a feature
await enableFeature('firebaseDirectIntegration');

// To disable a feature
await disableFeature('firebaseDirectIntegration');
```
*Note: These are asynchronous operations as they involve IndexedDB writes.*

### Getting All Feature Flags

Use the `getAllFeatureFlags` function to retrieve the current state of all feature flags:

```javascript
import { getAllFeatureFlags } from '../../../core/config/featureFlags';

const allFlags = getAllFeatureFlags();
console.log(allFlags);
```

## Adding New Feature Flags

To add a new feature flag:

1.  Add a new key-value pair to the `DEFAULT_FLAGS` object in `client/src/core/config/featureFlags.js`.
    ```javascript
    const DEFAULT_FLAGS = {
      firebaseDirectIntegration: false,
      analyticsDirectIntegration: false,
      newAwesomeFeature: true, // Add your new flag here
    };
    ```
2.  Add a description for the new flag in the `featureFlagDescriptions` object in `client/src/features/settings/components/FeatureToggles.js`.
    ```javascript
    const featureFlagDescriptions = {
      firebaseDirectIntegration: '...',
      analyticsDirectIntegration: '...',
      newAwesomeFeature: 'Enables the new awesome feature.', // Add description
    };
    ```
3.  Use `isFeatureEnabled('newAwesomeFeature')` in your code to conditionally enable/disable the feature logic.

## Admin UI

The `client/src/features/settings/components/FeatureToggles.js` component provides an administrative interface for viewing and managing feature flags. It displays the status, description, and last change timestamp for each flag. It also includes placeholder sections for future enhancements like comprehensive admin controls, analytics visualization, and auto-disable system status.

*Note: Access to this UI should be restricted to authorized users.*

## Analytics and Performance Tracking (Basic)

Basic tracking is integrated into the feature flag system:

-   **Usage Tracking:** Every time `isFeatureEnabled` is called, a message is logged to the console indicating which flag was checked. This provides a basic audit trail of flag usage.
-   **Performance Monitoring:** The `startPerformanceTimer(featureName)` and `stopPerformanceTimer(featureName)` functions can be used to measure the execution time of code blocks associated with a feature flag. The duration is logged to the console.

*Note: For production use, these should be integrated with a dedicated analytics and performance monitoring platform (e.g., Google Analytics, Sentry, Datadog).*

## Automatic Disabling System

The `client/src/utils/errorHandler.js` utility is integrated with the feature flag system to provide an automatic disabling mechanism:

-   **Error Tracking:** The `handleError` function tracks consecutive errors associated with a specific feature flag (when the `featureName` parameter is provided).
-   **Automatic Disabling:** If the number of consecutive errors for a feature flag reaches a predefined `ERROR_THRESHOLD`, the flag is automatically disabled using `disableFeature`.
-   **Notifications:** A console warning is logged when a flag is automatically disabled. *Note: This should be augmented with a proper notification system (e.g., alerts to monitoring).*
-   **Gradual Recovery:** A placeholder exists for a gradual recovery system that would periodically attempt to re-enable auto-disabled flags to check if the underlying issue is resolved. This is not yet implemented.

## Documentation Updates

As part of completing the feature flag system, ensure the following documentation files are updated:

-   `docs/developer/guides/feature-toggle-system.md` (This guide)
-   `docs/maintenance/maintenance-recommendations.md` (Add section on feature flag management)
-   `docs/firebase/migration.md` (Update migration strategy with feature flags)
-   `docs/firebase/migration-history.md` (Document feature flag integration milestones)
-   `docs/guides/error-handling.md` (Update with feature flag error handling and auto-disable)
-   `docs/developer/guides/guide-deployment.md` (Add feature flag deployment strategy)
-   `docs/developer/guides/guide-testing.md` (Add testing with feature flags)
-   `docs/firebase-integration-checklist.md` (Track overall migration progress with flags)
-   `docs/known-issues.md` (Document any limitations or issues related to flags)
-   `docs/maintenance/maintenance-technical-debt.md` (Track technical debt related to flags)
-   `README.md` (Briefly mention the feature flag system)

## Future Enhancements

-   Implement a full audit log in IndexedDB.
-   Integrate with a dedicated analytics and performance monitoring platform.
-   Implement the gradual recovery system for auto-disabled flags.
-   Consider server-based flag state for critical features or centralized management.
-   Implement more granular permission controls for flag management.
-   Add support for different flag types (e.g., percentage rollout, user segment-based).
