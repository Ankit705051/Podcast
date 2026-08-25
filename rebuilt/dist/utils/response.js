export const sendSuccess = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined && { data }),
    });
};
export const sendCreated = (res, message, data) => {
    return sendSuccess(res, 201, message, data);
};
export const sendOk = (res, message, data) => {
    return sendSuccess(res, 200, message, data);
};
//# sourceMappingURL=response.js.map