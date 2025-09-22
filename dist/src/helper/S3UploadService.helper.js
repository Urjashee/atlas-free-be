"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const uuid_1 = require("uuid");
class S3UploadService {
    constructor() {
        // Configure AWS SDK
        aws_sdk_1.default.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_DEFAULT_REGION,
        });
        this.s3 = new aws_sdk_1.default.S3();
    }
    uploadFile(file, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniqueFileName = `${folder}/${Date.now()}-${(0, uuid_1.v4)()}-${file.originalname}`;
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: uniqueFileName, // Unique file name
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            return new Promise((resolve, reject) => {
                this.s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data.Location);
                    }
                });
            });
        });
    }
    uploadPdfFile(file, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            const uniqueFileName = `${folder}/${Date.now()}-${(0, uuid_1.v4)()}`;
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `${uniqueFileName}.pdf`, // Unique file name
                Body: file,
                ContentType: file.mimetype,
            };
            return new Promise((resolve, reject) => {
                this.s3.upload(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data.Location);
                    }
                });
            });
        });
    }
    deleteFile(fileKeyOrUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileKey = fileKeyOrUrl.includes("https://") ? fileKeyOrUrl.split('.com/')[1] : fileKeyOrUrl;
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: fileKey,
            };
            return new Promise((resolve, reject) => {
                this.s3.deleteObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
}
exports.default = S3UploadService;
