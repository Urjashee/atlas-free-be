import AWS from "aws-sdk";
import { v4 as uuidv4 } from 'uuid';

class S3UploadService {
    private s3: AWS.S3;

    constructor() {
        // Configure AWS SDK
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_DEFAULT_REGION,
        });

        this.s3 = new AWS.S3();
    }

    public async uploadFile(file: Express.Multer.File, folder: string): Promise<unknown> {
        const uniqueFileName = `${folder}/${Date.now()}-${uuidv4()}-${file.originalname}`;
        const params = {
            Bucket: process.env.AWS_BUCKET!,
            Key: uniqueFileName, // Unique file name
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        return new Promise((resolve, reject) => {
            this.s3.upload(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Location);
                }
            });
        });
    }
    public async deleteFile(fileKeyOrUrl: string): Promise<void> {
        const fileKey = fileKeyOrUrl.includes("https://") ? fileKeyOrUrl.split('.com/')[1] : fileKeyOrUrl;

        const params = {
            Bucket: process.env.AWS_BUCKET!,
            Key: fileKey,
        };

        return new Promise((resolve, reject) => {
            this.s3.deleteObject(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

export default S3UploadService;
