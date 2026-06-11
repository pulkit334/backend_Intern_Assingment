const { body, param, query } = require('express-validator');

const createPostRules = [
  body('text')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Text must be under 5000 characters'),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
];

const updatePostRules = [
  body('text')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Text must be under 5000 characters'),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
  param('id').isMongoId().withMessage('Invalid post ID'),
];

const commentRules = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters'),
  param('id').isMongoId().withMessage('Invalid post ID'),
];

const postIdRule = [
  param('id').isMongoId().withMessage('Invalid post ID'),
];

const userIdRule = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
];

const commentIdRules = [
  param('id').isMongoId().withMessage('Invalid post ID'),
  param('commentId').isMongoId().withMessage('Invalid comment ID'),
];

module.exports = {
  createPostRules, updatePostRules, commentRules,
  postIdRule, userIdRule, commentIdRules,
};
