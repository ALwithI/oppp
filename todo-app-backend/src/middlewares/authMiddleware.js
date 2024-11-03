import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET; // .env
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; // .env

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // not authorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user; // integrate user info in the request
        next();
    });
};
// Verify Acces Token
export const verifyRefreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.sendStatus(401); // not authorized

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden

        // Generate new access token
        const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    });
};

// refresh Access Token
export const refreshAccessToken = (req, res) => {
    const { id: userId } = req.user; 

    // generate new token
    const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });

    // send refresh token back to the user
    return res.json({ accessToken });
};