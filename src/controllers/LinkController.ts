import { Request, Response } from 'express';
import {
  getLinkById,
  createLinkId,
  createNewLink,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  linkBelongsToUser,
  deleteLinkById,
} from '../models/LinkModel';
import { parseDatabaseError } from '../utils/db-utils';
import { getUserById } from '../models/UserModel';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  if (!req.session.isLoggedIn) {
    res.sendStatus(401); // Make sure the user is logged in
    return;
  } // send the appropriate response
  const { authenticatedUser } = req.session; // Get the userId from `req.session`
  const { userId } = authenticatedUser;
  const user = getUserById(userId); // Retrieve the user's account data using their ID
  if (user === null) {
    res.sendStatus(404); // Check if you got back `null`
    return;
  } // send the appropriate response
  if (!(await user).isPro && !(await user).isAdmin) {
    // Check if the user is neither a "pro" nor an "admin" account
    const linkGen = (await user).links.length; // check how many links they've already generated
    if (linkGen > 5) {
      // if they have generated 5 links
      res.sendStatus(403); // send the appropriate response
    }
  }
  const { originalUrl } = req.body as NewLinkRequest;
  const linkId = createLinkId(originalUrl, userId);

  try {
    const newLink = await createNewLink(originalUrl, linkId, await user);
    console.log(newLink);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    const dbErrMessage = parseDatabaseError(err);
    res.status(500).json(dbErrMessage);
  }

  // Generate a `linkId`
  // Add the new link to the database (wrap this in try/catch)
  // Respond with status 201 if the insert was successful
}

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  const { targetLinkId, targetURL } = req.params as LinkIdParam; // Retrieve the link data using the targetLinkId from the path parameter
  if (targetLinkId === null) {
    // Check if you got back `null`
    res.sendStatus(404); // send the appropriate response
  }
  const link = getLinkById(targetLinkId);
  updateLinkVisits(await link); // Call the appropriate function to increment the number of hits and the last accessed date
  res.redirect(302, targetURL); // Redirect the client to the original URL
}

async function getUserLinks(req: Request, res: Response): Promise<void> {
  const { targetUserId } = req.params as UserIdParam;
  const { authenticatedUser } = req.session;
  const { userId } = authenticatedUser;
  if (targetUserId === userId) {
    const links = await getLinksByUserIdForOwnAccount(userId);
    res.json(links);
  } else {
    const links = await getLinksByUserId(targetUserId);
    res.json(links);
  }
}

async function deleteUserLink(req: Request, res: Response): Promise<void> {
  const { isLoggedIn, authenticatedUser } = req.session;
  if (!isLoggedIn) {
    // res.sendStatus(401);
    res.redirect('/login');
    return;
  }

  const { targetLinkId } = req.params as LinkIdParam;
  if (targetLinkId === null) {
    res.sendStatus(404);
    return;
  }

  const linkExists = await linkBelongsToUser(targetLinkId, authenticatedUser.userId);
  if (!linkExists) {
    res.sendStatus(403);
    return;
  }

  await deleteLinkById(targetLinkId);
  res.sendStatus(200);
}

export { shortenUrl, getOriginalUrl, getUserLinks, deleteUserLink };
