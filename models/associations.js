// models/association.js
import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Follower from './Followers.js';

// USER - POST (One-to-Many)
User.hasMany(Post, { foreignKey: 'createdBy', onDelete: 'CASCADE', hooks: true });
Post.belongsTo(User, { foreignKey: 'createdBy' });

// POST - COMMENT (One-to-Many)
Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE', hooks: true });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// USER - COMMENT (One-to-Many)
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Comment.belongsTo(User, { foreignKey: 'userId' });

// POST - LIKE (One-to-Many)
Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE', hooks: true });
Like.belongsTo(Post, { foreignKey: 'postId' });

// USER - LIKE (One-to-Many)
User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE', hooks: true });
Like.belongsTo(User, { foreignKey: 'userId' });

// USER - FOLLOWER (Many-to-Many through Follower model)
User.belongsToMany(User, {
    through: Follower,
    as: 'Followers',         // Who follows me
    foreignKey: 'userId',
    otherKey: 'followerId',
});

User.belongsToMany(User, {
    through: Follower,
    as: 'Following',         // Whom I follow
    foreignKey: 'followerId',
    otherKey: 'userId',
});

// For getting followers/following with user details
Follower.belongsTo(User, { foreignKey: 'followerId', as: 'FollowerInfo' });
Follower.belongsTo(User, { foreignKey: 'userId', as: 'FollowingInfo' });

export { User, Post, Comment, Like, Follower }; 
