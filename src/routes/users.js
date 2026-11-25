import bcrypt from 'bcryptjs';
import { getDb } from '../db/connect.js';

const ROLES = ['admin', 'user'];

const getUsersCollection = () => {
  return getDb().collection('users');
};

const getRolesCollection = () => {
  return getDb().collection('roles');
};

const toPublicUser = (user) => {
  if (!user) return null;
  return {
    id: String(user._id),
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    role: user.role
  };
};

const findUserByUsername = async (username) => {
  return getUsersCollection().findOne({ username });
};

const findUserByEmail = async (email) => {
  return getUsersCollection().findOne({ email });
};

const createUser = async ({ displayName, username, email, password, role = 'user' }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await getUsersCollection().insertOne({
    displayName, username, email, passwordHash, role, createdAt: new Date()
  });
  return { id: String(result.insertedId), displayName, username, email, role };
};

const verifyPassword = async (user, password) => {
  return bcrypt.compare(password, user.passwordHash);
};

export { ROLES, createUser, findUserByEmail, findUserByUsername, getRolesCollection, getUsersCollection, toPublicUser, verifyPassword };