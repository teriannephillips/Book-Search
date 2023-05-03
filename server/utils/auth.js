module.exports = {
  // Middleware function that authenticates the user's JWT
  authMiddleware: function ({ req }) {
    // Get the token from the request, which could be sent in the query string, headers, or request body
    let token = req.query.token || req.headers.authorization || req.body.token;

    // If the token is sent in the headers, extract it from the "Bearer <token>" format
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If no token is found, return the request object as is
    if (!token) {
      return req;
    }

    // Verify the token and extract the user data from it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      // If the token is invalid, log an error and return a 400 status with an error message
      console.log('Invalid token');
      return res.status(400).json({ message: 'invalid token!' });
    }

    // If the token is valid, return the request object with the user data added to it
    return req;
  },

  // Function for creating a JWT token for a user
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    // Sign the token with the user data and the secret key, and set an expiration date
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
