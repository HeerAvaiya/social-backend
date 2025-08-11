import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Follower from './Followers.js';

User.hasMany(Post, {
    foreignKey: 'createdBy',
    as: 'posts',
    onDelete: 'CASCADE',
    hooks: true,
});
Post.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Post.hasMany(Comment, { foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Like, { foreignKey: 'postId', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Like, { foreignKey: 'userId', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'userId' });


User.belongsToMany(User, {
    through: Follower,
    as: 'Followers',    
    foreignKey: 'userId',
    otherKey: 'followerId',
});
User.belongsToMany(User, {
    through: Follower,
    as: 'Following',     
    foreignKey: 'followerId',
    otherKey: 'userId',
});

User.hasMany(Follower, { foreignKey: 'userId', as: 'FollowerRequestsReceived' }); 
User.hasMany(Follower, { foreignKey: 'followerId', as: 'FollowerRequestsSent' });  

Follower.belongsTo(User, { foreignKey: 'followerId', as: 'FollowerInfo' }); 
Follower.belongsTo(User, { foreignKey: 'userId', as: 'FollowingInfo' });   

export { User, Post, Comment, Like, Follower };
