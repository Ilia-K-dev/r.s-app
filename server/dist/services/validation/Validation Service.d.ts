declare const _exports: ValidationService;
export = _exports;
declare class ValidationService {
    validators: {
        auth: {
            register: import("express-validator").ValidationChain[];
            login: import("express-validator").ValidationChain[];
        };
        receipt: {
            create: import("express-validator").ValidationChain[];
            update: import("express-validator").ValidationChain[];
        };
        product: {
            create: import("express-validator").ValidationChain[];
            update: import("express-validator").ValidationChain[];
        };
        category: {
            create: import("express-validator").ValidationChain[];
            update: import("express-validator").ValidationChain[];
        };
        inventory: {
            stockUpdate: import("express-validator").ValidationChain[];
            transfer: import("express-validator").ValidationChain[];
        };
    };
    patterns: {
        email: RegExp;
        password: RegExp;
        phone: RegExp;
        date: RegExp;
        price: RegExp;
    };
    _createAuthValidators(): {
        register: import("express-validator").ValidationChain[];
        login: import("express-validator").ValidationChain[];
    };
    _createReceiptValidators(): {
        create: import("express-validator").ValidationChain[];
        update: import("express-validator").ValidationChain[];
    };
    _createProductValidators(): {
        create: import("express-validator").ValidationChain[];
        update: import("express-validator").ValidationChain[];
    };
    _createCategoryValidators(): {
        create: import("express-validator").ValidationChain[];
        update: import("express-validator").ValidationChain[];
    };
    _createInventoryValidators(): {
        stockUpdate: import("express-validator").ValidationChain[];
        transfer: import("express-validator").ValidationChain[];
    };
    commonValidators: {
        pagination: import("express-validator").ValidationChain[];
        dateRange: import("express-validator").ValidationChain[];
        sorting: import("express-validator").ValidationChain[];
    };
    validateEmail(email: any): boolean;
    validatePassword(password: any): boolean;
    validatePrice(price: any): boolean;
    validateDate(date: any): boolean;
    validateReceiptData(data: any): {
        isValid: boolean;
        errors: string[];
    };
    validateProductData(data: any): {
        isValid: boolean;
        errors: string[];
    };
    validate(schema: any): (req: any, res: any, next: any) => Promise<void>;
}
