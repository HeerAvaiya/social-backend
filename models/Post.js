import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Post = sequelize.define('Post', {
    caption: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cloudinaryPublicId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
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