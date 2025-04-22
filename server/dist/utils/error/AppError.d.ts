export const __esModule: boolean;
export default AppError;
export class AppError extends Error {
    constructor(message: any, statusCode: any);
    statusCode: any;
    status: string;
    isOperational: boolean;
}
