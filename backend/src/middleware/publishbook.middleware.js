import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  // 1. Check for token in multiple cookie names or Authorization Header
  // This ensures that even if the cookie name is 'token' or 'admin_token', it works.
  const token = 
    req.cookies?.admin_token || 
    req.cookies?.token || 
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: No admin token provided. Please log in." 
    });
  }

  try {
    // Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure the user actually has the admin role
    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: You do not have administrative privileges." 
      });
    }

    // Attach admin data to the request object for use in controllers
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Session expired or invalid token." 
    });
  }
};

export const verifyUser = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(); 
  }
};