export = VisionService;
declare class VisionService {
    static extractText(imageBuffer: any): Promise<string | null | undefined>;
    static uploadImage(imageBuffer: any, userId: any, fileName: any): Promise<{
        url: any;
        path: string;
    }>;
}
