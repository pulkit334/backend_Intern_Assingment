const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createPostRules, updatePostRules, commentRules,
  postIdRule, userIdRule, commentIdRules,
} = require('../validators/post');

router.get('/', auth, postController.getAllPosts);
router.get('/user/:userId', auth, validate(userIdRule), postController.getUserPosts);
router.post('/', auth, validate(createPostRules), postController.createPost);
router.patch('/:id', auth, validate(updatePostRules), postController.updatePost);
router.delete('/:id', auth, validate(postIdRule), postController.deletePost);
router.post('/:id/like', auth, validate(postIdRule), postController.toggleLike);
router.post('/:id/comment', auth, validate(commentRules), postController.addComment);
router.delete('/:id/comment/:commentId', auth, validate(commentIdRules), postController.deleteComment);

module.exports = router;
