const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    // Support local demo accounts created without a database.
    if (token.startsWith("local-")) {
      const localId = token.slice(6);

      if (!localId) {
        return res.status(401).json({
          success: false,
          message: "Invalid local token",
        });
      }

      const role = localId.split("-")[0];

      req.user = {
        id: localId,
        role,
      };

      return next();
    }

    // Normal JWT authentication
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !roles.includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }
    next();
  };
};