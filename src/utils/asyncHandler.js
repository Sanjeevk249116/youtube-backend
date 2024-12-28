const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};
module.exports = { asyncHandler };

// try {
//     await fn(req, res, next)
// }
// catch (error) {
//     res.status(error.code || 400).json({
//         message: error.message
//     })
// }
