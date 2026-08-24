// Global Request Logger Middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Listen for completion of HTTP response cycle
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;

    // Log format: [METHOD] [PATH] [STATUS] [RESPONSE-TIME ms]
    console.log(`[${method}] [${path}] [${status}] [${responseTime}ms]`);
  });

  next();
};

module.exports = requestLogger;
