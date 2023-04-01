import './config'; // Load environment variables
import 'express-async-errors'; // Enable default error handling for async errors
import express, { Express } from 'express';

import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn } from './controllers/UserController';
import {
  shortenUrl,
  getOriginalUrl,
  getUserLinks,
  deleteUserLink,
} from './controllers/LinkController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());

app.post('/api/users', registerUser);
app.post('api/login', logIn);
app.post('api/links', shortenUrl);
app.get('/:targetLinkId', getOriginalUrl);
app.get('/api/users/:targetUserId/links', getUserLinks);
app.delete('/api/users/:targetUserId/links/:targetLinkId', deleteUserLink);
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
