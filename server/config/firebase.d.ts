declare const _exports: {
    admin: typeof admin;
    db: admin.firestore.Firestore;
    auth: import("firebase-admin/lib/auth/auth").Auth;
    storage: import("firebase-admin/lib/storage/storage").Storage;
    diagnose: () => /*elided*/ any;
} | {
    error: boolean;
    message: any;
    diagnose: () => null;
};
export = _exports;
import admin = require("firebase-admin");
