import JWT from "jsonwebtoken";

function createTokenPair(payload) {
    return {
        accessToken: JWT.sign(payload, process.env.ATSECRETKEY, { expiresIn: "1w" }),
        refreshToken: JWT.sign(payload, process.env.RTSECRETKEY, { expiresIn: "4w" }),
    };
}

function createTokenUser(payload) {
    return {
        token: JWT.sign(payload, process.env.ATSECRETKEY, { expiresIn: "10m" }),
    };
}

function verifyTokenPair(token) {
    return JWT.verify(token, process.env.ATSECRETKEY);
}

export { createTokenPair, createTokenUser, verifyTokenPair };
