const postService = require('../services/postService');
const { sendSuccess } = require('../utils/response');

exports.getAllPosts = async (req, res, next) => {
  try {
    const posts = await postService.getAllPosts(req.query.sort);
    sendSuccess(res, { posts });
  } catch (err) {
    next(err);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await postService.getUserPosts(req.params.userId);
    sendSuccess(res, { posts });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.userId, req.body);
    sendSuccess(res, { post }, 201);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.userId, req.body);
    sendSuccess(res, { post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.userId);
    sendSuccess(res, { message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.params.id, req.userId);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const comments = await postService.addComment(req.params.id, req.userId, req.body.text);
    sendSuccess(res, { comments });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comments = await postService.deleteComment(req.params.id, req.params.commentId, req.userId);
    sendSuccess(res, { comments });
  } catch (err) {
    next(err);
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    const result = await postService.uploadImage(req.file);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};
