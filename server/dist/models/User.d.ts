export = User;
declare class User {
    static findById(userId: any): Promise<User | null>;
    static findByEmail(email: any): Promise<User | null>;
    constructor(data: any);
    id: any;
    email: any;
    name: any;
    preferences: any;
    createdAt: any;
    updatedAt: Date;
    active: any;
    lastLoginAt: any;
    save(): Promise<this>;
    update(data: any): Promise<this>;
    delete(): Promise<void>;
    updateLoginTimestamp(): Promise<this>;
    toJSON(): {
        email: any;
        name: any;
        preferences: any;
        createdAt: any;
        updatedAt: Date;
        active: any;
        lastLoginAt: any;
    };
    validate(): string[];
}
