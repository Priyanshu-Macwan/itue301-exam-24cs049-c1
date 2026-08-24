const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => val.message);
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field entered';
    const field = Object.keys(err.keyValue)[0];
    errors = [`An account with this ${field} already exists`];
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Resource not found';
    errors = ['Invalid ObjectId format'];
  } else {
    errors = [message];
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    errors
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`
  });
};

module.exports = { errorHandler, notFound };
