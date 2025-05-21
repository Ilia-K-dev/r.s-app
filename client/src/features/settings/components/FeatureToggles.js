// client/src/features/settings/components/FeatureToggles.js

import React, { useState, useEffect } from 'react';
import { isFeatureEnabled, enableFeature, disableFeature, getAllFeatureFlags } from '../../../core/config/featureFlags';
import { openDB } from 'idb'; // Import openDB to access audit logs

// IndexedDB configuration (should match featureFlags.js)
const DB_NAME = 'featureFlagsDB';
const STORE_NAME = 'flags';
const FLAGS_KEY = 'currentFlags';

// Feature flag descriptions (can be moved to a separate config file later)
const featureFlagDescriptions = {
  firebaseDirectIntegration: 'Enables direct integration with Firebase services (Firestore, Storage, etc.) instead of using the Express backend API.',
  analyticsDirectIntegration: 'Enables direct integration with analytics services instead of using a backend proxy.',
  // Add descriptions for other flags here
};

// Placeholder for permission check (replace with actual permission logic)
const canEditFeatureFlags = (user) => {
  // In a real application, check user roles or permissions
  // For now, we'll assume anyone can edit in a dev/staging environment
  return true;
};

const FeatureToggles = () => {
  const [allFlags, setAllFlags] = useState({});
  const [auditLog, setAuditLog] = useState([]);
  const [canEdit, setCanEdit] = useState(canEditFeatureFlags(null)); // Pass actual user object if available

  // Load flags and audit log on component mount and when storage changes
  useEffect(() => {
    const loadData = async () => {
      setAllFlags(getAllFeatureFlags());
      await loadAuditLog();
    };

    const handleStorageChange = () => {
      console.log('Storage change detected, reloading feature flags and audit log.');
      loadData();
    };

    // Listen for changes signaled from other tabs (via localStorage event)
    window.addEventListener('storage', handleStorageChange);

    // Initial load
    loadData();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadAuditLog = async () => {
    try {
      const db = await openDB(DB_NAME, 1); // Use DB_VERSION from featureFlags.js if possible, or hardcode if stable
      const savedData = await db.get(STORE_NAME, FLAGS_KEY);
      if (savedData && savedData.audit) {
        // For now, we just store the last audit entry.
        // To have a full log, we'd need a separate object store for audit entries.
        // This is a simplified view showing the last change.
        setAuditLog([savedData.audit]);
      } else {
        setAuditLog([]);
      }
    } catch (error) {
      console.error('Error loading audit log from IndexedDB:', error);
      setAuditLog([]);
    }
  };


  const handleToggleChange = async (featureName, isEnabled) => {
    if (!canEdit) {
      alert('You do not have permission to change feature flags.');
      return;
    }

    if (isEnabled) {
      await enableFeature(featureName);
    } else {
      await disableFeature(featureName);
    }
    // Update local state after change
    setAllFlags(getAllFeatureFlags());
    await loadAuditLog(); // Reload audit log after a change
  };

  return (
    <div>
      <h2>Feature Toggles Admin</h2>

      {!canEdit && (
        <p style={{ color: 'red' }}>You do not have permission to edit feature flags.</p>
      )}

      <div>
        <h3>Available Flags:</h3>
        {Object.entries(allFlags).map(([flagName, isEnabled]) => (
          <div key={flagName} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc' }}>
            <h4>{flagName}</h4>
            <p>Status: <strong style={{ color: isEnabled ? 'green' : 'red' }}>{isEnabled ? 'Enabled' : 'Disabled'}</strong></p>
            <p>Description: {featureFlagDescriptions[flagName] || 'No description available.'}</p>
            <button onClick={() => handleToggleChange(flagName, true)} disabled={isEnabled || !canEdit}>Enable</button>
            <button onClick={() => handleToggleChange(flagName, false)} disabled={!isEnabled || !canEdit}>Disable</button>
            {/* Placeholder for permission control per flag */}
            {/* <p>Permissions: Admin Only</p> */}
            {/* Placeholder for flag status visualization (basic text status above) */}
          </div>
        ))}
      </div>

      {/* Placeholder for comprehensive admin controls (e.g., adding/removing flags - requires backend) */}
      {/* <div>
        <h3>Admin Controls</h3>
        <p>Add New Flag (Requires Backend)</p>
        <p>Remove Flag (Requires Backend)</p>
      </div> */}

      <div>
        <h3>Flag Change History (Last Change):</h3>
        {auditLog.length > 0 ? (
          <ul>
            {auditLog.map((log, index) => (
              <li key={index}>
                Timestamp: {log.timestamp}, User: {log.userId}
                {/* To show which flag changed, we would need a more detailed audit log in IndexedDB */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No change history available.</p>
        )}
         {/* Placeholder for full audit log view */}
         {/* <p>View Full Audit Log (Requires separate audit store in IndexedDB)</p> */}
      </div>

      {/* Placeholder for Flag Analytics */}
      {/* <div>
        <h3>Flag Analytics</h3>
        <p>Usage Tracking: (Requires analytics integration)</p>
        <p>Performance Monitoring: (Requires performance monitoring integration)</p>
        <p>Impact Visualization: (Requires data collection and visualization library)</p>
        <p>User Segment Analysis: (Requires user segmentation logic)</p>
      </div> */}

       {/* Placeholder for Auto-Disable System Status */}
       {/* <div>
         <h3>Auto-Disable System Status</h3>
         <p>Error Thresholds: (Display configured thresholds)</p>
         <p>Current Error Counts: (Display current counts per feature)</p>
         <p>Auto-Disabled Flags: (List flags currently auto-disabled)</p>
         <p>Recovery Status: (Show status of gradual recovery)</p>
       </div> */}
    </div>
  );
};

export default FeatureToggles;

// Add comments about purpose and design
// Purpose: Provides an enhanced user interface for managing feature flags, displaying their status, descriptions, and basic change history.
// Design: A React functional component that fetches all available flags and their states. It renders a list of toggles, allowing users with sufficient permissions to enable or disable flags. It also displays descriptions and a simplified view of the last change from the audit log stored in IndexedDB. Placeholder sections are included for future comprehensive admin controls, analytics, and auto-disable system status.
// How to add to the app: This component should be added to a protected settings page or an admin panel route within the client application, ensuring only authorized users can access and modify feature flags.
// Permissions: Includes a placeholder `canEditFeatureFlags` function to demonstrate how permission checks can be integrated. This should be replaced with actual user role/permission logic.
// Audit Log: Currently displays only the timestamp and user ID of the last change stored with the flags in IndexedDB. A full audit log would require a dedicated object store in IndexedDB to store each change event.
