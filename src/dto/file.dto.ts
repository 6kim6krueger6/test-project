export interface FileUploadDto {
    name: string,
    extension: string,
    mimeType: string,
    size: number,
    path: string,
    userId: number
}