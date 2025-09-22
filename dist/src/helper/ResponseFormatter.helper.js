"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
class ResponseFormatter {
    static successResponse(res, message = 'Operation completed successfully.', data = null) {
        const response = {
            status: 'OK',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(200).json(response);
    }
    static errorResponse(res, message = 'Failed to complete the operation!', data = null) {
        const response = {
            status: 'ERROR',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(400).json(response);
    }
    static unauthorizedResponse(res, message = 'You are not authorized to access this resource!', data = null) {
        const response = {
            status: 'UNAUTHORIZED',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(401).json(response);
    }
    static forbiddenResponse(res, message = 'You are not allowed to access this resource!', data = null) {
        const response = {
            status: 'FORBIDDEN',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(403).json(response);
    }
    static serverErrorResponse(res, message = 'Internal server error', data = null) {
        const response = {
            status: 'SERVER ERROR',
            message,
        };
        if (data) {
            response.data = ResponseFormatter.createDataKeyValueIfRequired(data);
        }
        return res.status(500).json(response);
    }
    static createDataKeyValueIfRequired(data) {
        if (Array.isArray(data) || (data && typeof data === 'object')) {
            return data;
        }
        return data ? { value: data } : data;
    }
}
exports.ResponseFormatter = ResponseFormatter;
