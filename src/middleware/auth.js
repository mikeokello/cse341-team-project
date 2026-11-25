const requireApiLogin = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized - please log in.' });
  }
  return next();
};

const requirePageLogin = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  return next();
};

const requireApiRole = (role) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: 'Unauthorized - please log in.' });
    }
    if (req.session.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden - insufficient role.' });
    }
    return next();
  };
};

const requirePageRole = (role) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
      return res.status(403).render('errors/403', { title: 'Forbidden' });
    }
    return next();
  };
};

export { requireApiLogin, requireApiRole, requirePageLogin, requirePageRole };