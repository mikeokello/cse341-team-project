import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/connect.js';

function getCollection() {
    return getDb().collection('users');
}

export function toPublicUser(user) {
    if (!user) return null;
    const { passwordHash, password, ...publicUser } = user;
    return publicUser;
}

export async function verifyPassword(plainPassword, passwordHash) {
    if (!plainPassword || !passwordHash) return false;
    return await bcrypt.compare(plainPassword, passwordHash);
}

export async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, 10);
}

export async function findUserByUsername(username) {
    if (!username) return null;
    return await getCollection().findOne({ username: username.toLowerCase().trim() });
}

export async function findUserByEmail(email) {
    if (!email) return null;
    return await getCollection().findOne({ email: email.toLowerCase().trim() });
}

export async function findUserById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await getCollection().findOne({ _id: new ObjectId(id) });
}

export async function createUser(userData) {
    const passwordHash = await hashPassword(userData.password);
    const newUser = {
        displayName: userData.displayName,
        username: userData.username.toLowerCase().trim(),
        email: userData.email.toLowerCase().trim(),
        passwordHash: passwordHash,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    const result = await getCollection().insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
}

export async function getAllUsers() {
    return await getCollection().find({}).sort({ createdAt: -1 }).toArray();
}