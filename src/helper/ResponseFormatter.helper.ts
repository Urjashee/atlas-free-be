import { Response } from 'express';

export class ResponseFormatter {
    static successResponse(res: Response, message: string = 'Operation completed successfully.', data: any = null): Response {
        const response: { status: string; message: string; data?: any } = {
            status: 'OK',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(200).json(response);
    }

    static errorResponse(res: Response, message: string = 'Failed to complete the operation!', data: any = null): Response {
        const response: { status: string; message: string; data?: any } = {
            status: 'ERROR',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(400).json(response);
    }

    static unauthorizedResponse(res: Response, message: string = 'You are not authorized to access this resource!', data: any = null): Response {
        const response: { status: string; message: string; data?: any } = {
            status: 'UNAUTHORIZED',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(401).json(response);
    }

    static forbiddenResponse(res: Response, message: string = 'You are not allowed to access this resource!', data: any = null): Response {
        const response: { status: string; message: string; data?: any } = {
            status: 'FORBIDDEN',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(403).json(response);
    }

    static serverErrorResponse(res: Response, message: string = 'Internal server error', data: any = null): Response {
        const response: { status: string; message: string; data?: any } = {
            status: 'SERVER ERROR',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(500).json(response);
    }

    static createDataKeyValueIfRequired(data: any): any {
        if (Array.isArray(data) || (data && typeof data === 'object')) {
            return data;
        }
        return data ? { value: data } : data;
    }
}
