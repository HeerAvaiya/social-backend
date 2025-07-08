import User from "../models/User.js";

const findUser = async (whereQuery) => {
    const result = await User.findOne({ where: whereQuery });
    if (result?.password) delete result.dataValues.password;
    return result;
};

const updateUser = async (id, userBody) => {
    await User.update(userBody, { where: { id } });
    return await findUser({ id });
};

export default {
    findUser,
    updateUser
};
