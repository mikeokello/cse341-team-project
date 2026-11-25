import bcrypt from 'bcryptjs';
import trips from './seeds/trips.json' with { type: 'json' };
import schedules from './seeds/schedules.json' with { type: 'json' };
import stations from './seeds/stations.json' with { type: 'json' };
import ticketClasses from './seeds/ticket-classes.json' with { type: 'json' };
import trains from './seeds/trains.json' with { type: 'json' };

const starterCollections = [
  ['trips', trips],
  ['schedules', schedules],
  ['stations', stations],
  ['ticketClasses', ticketClasses],
  ['trains', trains]
];

const initializeDatabase = async (db) => {
  if (!db) {
    throw new Error('A database connection is required to initialize data.');
  }

  for (const [collectionName, documents] of starterCollections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(documents);
  }

  const confirmations = db.collection('confirmations');
  await confirmations.deleteMany({});
  await confirmations.createIndex({ id: 1 }, { unique: true });

  const roles = db.collection('roles');
  await roles.deleteMany({});
  await roles.insertMany([{ name: 'admin' }, { name: 'user' }]);

  const users = db.collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  const existingAdmin = await users.findOne({ username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    await users.insertOne({
      displayName: 'Admin User',
      username: 'admin',
      email: 'admin@kizuna.test',
      passwordHash,
      role: 'admin',
      createdAt: new Date()
    });
  }
};

export { initializeDatabase, starterCollections };