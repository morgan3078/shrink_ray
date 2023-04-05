import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addNewUser, getUserByUsername } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;
  const user = getUserByUsername(username);
  if (user === null) {
    res.sendStatus(404);
    return;
  }
  const passwordHash = await argon2.hash(password);

  try {
    const newUser = await addNewUser(username, passwordHash);
    console.log(newUser);
    // res.sendStatus(201);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    const dbErrMessage = parseDatabaseError(err);
    res.status(500).json(dbErrMessage);
  }
  // TODO: Implement the registration code
  // Make sure to check if the user with the given username exists before attempting to add the account
  // Make sure to hash the password before adding it to the database
  // Wrap the call to `addNewUser` in a try/catch like in the sample code
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;

  const user = await getUserByUsername(username);
  if (!user) {
    res.sendStatus(403);
    return;
  }

  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(403);
    return;
  }

  await req.session.clearSession();

  req.session.authenticatedUser = {
    userId: user.userId,
    isPro: user.isPro,
    isAdmin: user.isAdmin,
    username: user.username,
  };
  req.session.isLoggedIn = true;

  // res.sendStatus(200);
  res.redirect('/shrink');
}

export { registerUser, logIn };
