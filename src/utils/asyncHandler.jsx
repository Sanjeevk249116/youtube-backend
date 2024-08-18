const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error))
    }
}
export { asyncHandler }

// try {
//     await fn(req, res, next)
// }
// catch (error) {
//     res.status(error.code || 400).json({
//         message: error.message
//     })
// }