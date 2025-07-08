// Post.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Post = sequelize.define('Post', {
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    commentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    tableName: 'posts',
    timestamps: true,
});

export default Post;
