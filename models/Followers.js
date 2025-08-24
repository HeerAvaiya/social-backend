import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Follower = sequelize.define('Follower', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
    }
}, {
    tableName: 'followers',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'followerId'] }],
});

export default Follower;
