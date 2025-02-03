const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Initialize express-session to store the token in the session
app.use("/customer", session({
  secret: "fingerprint_customer",  // Session secret key
  resave: true,
  saveUninitialized: true
}));

// Middleware to authenticate JWT token from session
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the session has a token
  if (req.session && req.session.token) {
    // If session has a token, verify it using JWT
    jwt.verify(req.session.token, "your_secret_key", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token or session expired" });
      }
      // If token is valid, attach the decoded user to the request object
      req.user = decoded;
      next();
    });
  } else {
    // If there's no token in the session, deny access
    return res.status(401).json({ message: "Please log in first" });
  }
});

// Define your routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));