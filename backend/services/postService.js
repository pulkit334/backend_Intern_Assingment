const Post = require('../models/Post');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');
const config = require('../config/env');

exports.getAllPosts = async (sortBy) => {
  const sortOption = sortBy === 'likes' ? { likes: -1 } : { createdAt: -1 };
  return Post.find().sort(sortOption).populate('userId', 'name email').lean();
};

exports.getUserPosts = async (userId) => {
  return Post.find({ userId }).sort({ createdAt: -1 }).populate('userId', 'name email').lean();
};

exports.createPost = async (userId, { text, image }) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  return Post.create({
    userId,
    username: user.name,
    text: text || '',
    image: image || '',
  });
};

exports.updatePost = async (postId, userId, updates) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);
  if (post.userId.toString() !== userId) throw new AppError('Not authorized', 403);

  if (updates.text !== undefined) post.text = updates.text;
  if (updates.image !== undefined) post.image = updates.image;
  await post.save();
  return post;
};

exports.deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);
  if (post.userId.toString() !== userId) throw new AppError('Not authorized', 403);
  await Post.findByIdAndDelete(postId);
};

exports.toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  const alreadyLiked = post.likes.some(id => id.toString() === userId);
  if (alreadyLiked) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();
  return { likes: post.likes, likesCount: post.likes.length };
};

exports.addComment = async (postId, userId, text) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  post.comments.push({ userId, username: user.name, text });
  await post.save();
  return post.comments;
};

exports.deleteComment = async (postId, commentId, userId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  const comment = post.comments.id(commentId);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.userId.toString() !== userId) throw new AppError('Not authorized', 403);

  post.comments.pull(commentId);
  await post.save();
  return post.comments;
};

exports.uploadImage = async (file) => {
  if (!file) throw new AppError('No file uploaded', 400);

  const b64 = Buffer.from(file.buffer).toString('base64');
  const dataUri = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: config.cloudinary.folder,
  });

  return { url: result.secure_url, publicId: result.public_id };
};
