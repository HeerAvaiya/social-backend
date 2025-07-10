import bcrypt from "bcrypt";
import handler from "../utils/handler.js";
import { createTokenPair } from "../utils/jwt-handler.js";
import authService from "../services/auth.service.js";
import userService from "../services/user.service.js";

export const registerController = handler(async (req, res) => {
    const userBody = req.body;
    const user = await authService.createUser(userBody);
    
    const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    const tokens = createTokenPair(tokenPayload);

    return res.status(200).json({
        error: false,
        message: "You have signed up successfully!",
        data: {
            user: tokenPayload,
            tokens,
        },
    });
});

export const loginController = handler(async (req, res) => {
    const { email, password } = req.body;

    const user = await authService.isValidUser({ email });
    if (!user) throw new Error("Your account doesn't exist");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password, try again");

    const tokenPayload = {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    const tokens = createTokenPair(tokenPayload);

    return res.status(200).json({
        error: false,
        message: "You have logged in successfully!",
        data: {
            user: tokenPayload,
            tokens,
        },
    });
});
