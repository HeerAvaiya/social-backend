import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';
import Post from './Post.js';

const Like = sequelize.define('Like', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Post,
            key: 'id'
        }
    }
}, {
    tableName: 'likes',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'postId']
        }
    ]
});

export default Like;
