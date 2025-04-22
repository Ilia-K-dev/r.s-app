declare const _exports: CategoryManagementService;
export = _exports;
declare class CategoryManagementService {
    categoriesCollection: any;
    defaultCategories: {
        food: {
            color: string;
            icon: string;
            subCategories: string[];
        };
        household: {
            color: string;
            icon: string;
            subCategories: string[];
        };
        electronics: {
            color: string;
            icon: string;
            subCategories: string[];
        };
    };
    createCategory(userId: any, categoryData: any): Promise<{
        name: any;
        color: any;
        budget: any;
        parentId: any;
        userId: any;
        products: never[];
        createdAt: Date;
        updatedAt: Date;
        id: any;
    }>;
    getCategories(userId: any, options?: {}): Promise<any>;
    updateCategory(userId: any, categoryId: any, updateData: any): Promise<any>;
    deleteCategory(userId: any, categoryId: any): Promise<boolean>;
    initializeDefaultCategories(userId: any): Promise<{
        name: string;
        color: string;
        icon: string;
        userId: any;
        parentId: any;
        createdAt: Date;
        updatedAt: Date;
        id: any;
    }[]>;
    _includeCategoryProducts(categories: any): Promise<any[]>;
}
