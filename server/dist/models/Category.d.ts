export = Category;
declare class Category {
    static findByUserId(userId: any): Promise<any>;
    constructor(data: any);
    id: any;
    name: any;
    userId: any;
    color: any;
    budget: any;
    createdAt: any;
    save(): Promise<this>;
    toJSON(): {
        name: any;
        userId: any;
        color: any;
        budget: any;
        createdAt: any;
    };
}
