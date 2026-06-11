const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Post = require('../models/Post');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  return { accessToken, refreshToken };
};

exports.signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 400);

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email },
    ...tokens,
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid credentials', 400);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Invalid credentials', 400);

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email },
    ...tokens,
  };
};

exports.refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token required', 401);

  const user = await User.findOne({ refreshToken }).select('+refreshToken');
  if (!user) throw new AppError('Invalid refresh token', 401);

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { ...tokens, user: { id: user._id, name: user.name, email: user.email } };
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) throw new AppError('User not found', 404);
  return { id: user._id, name: user.name, email: user.email };
};

exports.updateProfile = async (userId, name) => {
  const user = await User.findByIdAndUpdate(userId, { name }, { new: true }).select('-password -refreshToken');
  if (!user) throw new AppError('User not found', 404);
  await Post.updateMany({ userId }, { username: name });
  return { id: user._id, name: user.name, email: user.email };
};

exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
