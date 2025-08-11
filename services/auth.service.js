
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Role from "../models/Role.js";

const createUser = async (userBody) => {
    const existingUser = await isValidUser({ email: userBody.email });
    if (existingUser) throw new Error("Email already exists");

    const role = await Role.findOne({ where: { name: "user" } });
    const hashedPassword = await bcrypt.hash(userBody.password, Number(process.env.SALTROUNDS));
    const user = await User.create({
        ...userBody,
        password: hashedPassword,
        roleId: role?.id,
    });

    return user;
};

const isValidUser = async (whereQuery) => {
    const user = await User.findOne({ where: whereQuery });
    return user;
};

export default {
    createUser,
    isValidUser,
};
