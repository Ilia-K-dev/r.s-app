# Receipt Scanner App - Project Structure Analysis

## 1. Top-Level Directories

```
app.v3/
├── client/
│   └── src/
│       ├── core/
│       ├── features/
│       ├── shared/
│       └── styles/
├── server/
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       └── utils/
├── functions/
├── .firebaserc
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
└── storage.rules
```

## 2. Organization Pattern

*   **Client (`client/src`):** Feature-based (`core`, `features`, `shared`)
*   **Server (`server/src`):** MVC / Model-Service-Controller (`controllers`, `models`, `routes`, `services`)

## 3. Client `src/` Directory Structure

```
client/src/
├── App.js              # Main application component
├── index.js            # Client entry point
├── routes.js           # Client-side routing configuration
├── core/               # Core application logic (config, contexts, base components)
│   ├── components/
│   ├── config/
│   │   ├── api.config.js
│   │   ├── constants.js
│   │   ├── firebase.js   # Firebase client config
│   │   └── theme.config.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ToastContext.js
│   ├── pages/
│   ├── routes/
│   └── types/
├── features/           # Feature modules
│   ├── analytics/
│   ├── auth/
│   ├── categories/
│   ├── documents/
│   ├── inventory/
│   ├── receipts/
│   └── settings/
├── shared/             # Shared components, hooks, services, utils
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── utils/
└── styles/             # Global styles
    └── tailwind.css
```

## 4. Key Configuration Files

*   **Root:**
    *   `.firebaserc`: Firebase project aliases
    *   `firebase.json`: Firebase hosting, functions, firestore rules config
    *   `firestore.indexes.json`: Firestore index definitions
    *   `firestore.rules`: Firestore security rules
    *   `storage.rules`: Cloud Storage security rules
*   **Client (`client/`):**
    *   `package.json`: Frontend dependencies and scripts
    *   `.eslintrc.js`: ESLint configuration
    *   `.prettierrc`: Prettier configuration
    *   `tailwind.config.js`: Tailwind CSS configuration
    *   `tsconfig.json`: TypeScript configuration (if using TS features)
    *   `src/core/config/firebase.js`: Firebase client SDK initialization
*   **Server (`server/`):**
    *   `package.json`: Backend dependencies and scripts
    *   `nodemon.json`: Nodemon development server configuration
    *   `tsconfig.json`: TypeScript configuration
    *   `config/firebase.js`: Firebase Admin SDK initialization
    *   `config/vision.js`: Google Cloud Vision API configuration
*   **Functions (`functions/`):**
    *   `package.json`: Cloud Functions dependencies and scripts
    *   `.eslintrc.js`: ESLint configuration

## 5. Main Entry Points

*   **Client:** `client/src/index.js` (Initial render), `client/src/App.js` (Root component)
*   **Server:** `server/src/app.js` (Express application setup)
*   **Functions:** `functions/index.js` (Cloud Functions definitions)

## 6. Critical Dependency Versions

*   **Client (`client/package.json`):**
    *   `react`: `18.2.0`
    *   `react-native`: `0.72.10`
    *   `expo`: `^52.0.37`
    *   `firebase`: `^10.14.1`
    *   `axios`: `^1.7.9`
    *   `chart.js`: `^4.4.8`
    *   `tailwindcss`: `^3.4.17`
    *   `tesseract.js`: `^5.0.3`
*   **Server (`server/package.json`):**
    *   `firebase-admin`: `^13.1.0`
    *   `express`: `^4.21.2`
    *   `@google-cloud/vision`: `^4.3.2`
    *   `axios`: `^1.7.9`
    *   `multer`: `^1.4.5-lts.1`
    *   `sharp`: `^0.33.5`
    *   `winston`: `^3.17.0`
*   **Functions (`functions/package.json`):** (Requires reading `functions/package.json` for specifics)
