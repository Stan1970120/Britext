import jwt from 'jsonwebtoken';

export const verifyAdmin = (req, res, next) => {
  // 1. Check for token in Cookies (standard for your Next.js setup)
  // 2. Fallback to Authorization Header (standard for mobile or external tools)
  const token = req.cookies?.admin_token || req.headers.authorization?.split(" ")[1];

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

// Optional: Add a standard verifyUser for the Bookstore readers
export const verifyUser = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    // We don't block here because guests can still browse, 
    // we just don't attach a user to req.
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(); // Move to next anyway, controller will handle 'unpaid' logic
  }
};