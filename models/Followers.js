// models/Followers.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Follower = sequelize.define('Follower', {
    userId: { // person being followed
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' },
    },
    followerId: { // person sending the request
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' },
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'followers',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'followerId'] }]
});

export default Follower;
