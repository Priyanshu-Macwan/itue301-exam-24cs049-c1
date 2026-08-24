// Centralized Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key Errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate entry for ${field}. Please use another value.`;
  }

  // Handle Bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Structured JSON response (no raw stack trace in error messages)
  res.status(statusCode).json({
    message: message
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    message: `Route not found - ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };
