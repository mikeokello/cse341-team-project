import { Router } from 'express';
import { createUser, findUserByEmail, findUserByUsername, toPublicUser, verifyPassword } from '../models/users.js';
import { requirePageRole } from '../middleware/auth.js';

const router = Router();

const showRegisterPage = (req, res) => {
  return res.render('auth/register', { title: 'Register', error: null });
};

const showLoginPage = (req, res) => {
  return res.render('auth/login', { title: 'Login', error: null });
};

const processRegister = async (req, res) => {
  try {
    const { displayName, username, email, password } = req.body;
    if (!displayName || !username || !email || !password) {
      return res.status(400).render('auth/register', { title: 'Register', error: 'All fields are required.' });
    }
    const existingUser = await findUserByUsername(username);
    const existingEmail = await findUserByEmail(email);
    if (existingUser || existingEmail) {
      return res.status(400).render('auth/register', { title: 'Register', error: 'Username or email already exists.' });
    }
    const user = await createUser({ displayName, username, email, password, role: 'user' });
    req.session.user = toPublicUser(user);
    return res.redirect('/');
  } catch (error) {
    return res.status(500).render('auth/register', { title: 'Register', error: 'Registration failed. Try again.' });
  }
};

const processLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await findUserByUsername(username);
    if (!user) {
      user = await findUserByEmail(username);
    }
    if (!user) {
      return res.status(401).render('auth/login', { title: 'Login', error: 'Invalid username or password.' });
    }
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).render('auth/login', { title: 'Login', error: 'Invalid username or password.' });
    }
    req.session.user = toPublicUser(user);
    return res.redirect('/');
  } catch (error) {
    return res.status(500).render('auth/login', { title: 'Login', error: 'Login failed. Try again.' });
  }
};

const processLogout = (req, res) => {
  req.session.destroy(() => {
    return res.redirect('/login');
  });
};

const showAdminDashboard = (req, res) => {
  return res.render('auth/admin-dashboard', { title: 'Admin Dashboard' });
};

router.get('/register', showRegisterPage);
router.post('/register', processRegister);
router.get('/login', showLoginPage);
router.post('/login', processLogin);
router.get('/logout', processLogout);
router.post('/logout', processLogout);
router.get('/admin', requirePageRole('admin'), showAdminDashboard);

export default router;