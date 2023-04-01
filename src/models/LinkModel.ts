import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';
import { User } from '../entities/User';
import { createHash } from '../crypto';

const linkRepository = AppDataSource.getRepository(Link);

async function getLinkById(linkId: string): Promise<Link | null> {
  const link = await linkRepository
    .createQueryBuilder('links')
    .leftJoinAndSelect('links.user', 'user')
    .where('link.linkId = :linkId', { linkId })
    .getOne();

  return link;
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(originalUrl.concat(userId));
  const urlHash = md5.digest('base64url');
  const linkId = urlHash.slice(0, 9);

  return linkId;
}

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  const newLink = new Link();
  newLink.originalUrl = originalUrl;
  newLink.linkId = linkId;
  newLink.user = creator;
  return newLink;
}

async function updateLinkVisits(link: Link): Promise<Link> {
  const updatedLink = link;
  updatedLink.numHits += 1; // Increment the link's number of hits property
  const now = new Date();
  updatedLink.lastAccessedOn = now; // Create a new date object and assign it to the link's `lastAccessedOn` property.
  await linkRepository
    .createQueryBuilder()
    .update(Link)
    .set({ numHits: updatedLink.numHits, lastAccessedOn: updatedLink.lastAccessedOn })
    .where({ linkId: updatedLink.linkId })
    .execute(); // Update the link's numHits and lastAccessedOn in the database
  return link; // return the updated link
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } }) // NOTES: This is how you do nested WHERE clauses
    .leftJoin('link.user', 'user')
    .select([
      'link',
      'link.linkId',
      'link.originalURL',
      'user.userId',
      'user.username',
      'user.isAdmin',
    ])
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } }) // NOTES: This is how you do nested WHERE clauses
    .leftJoin('link.user', 'user')
    .select([
      'link',
      'link.linkId',
      'link.numHits',
      'link.lastAccessedOn',
      'link.originalURL',
      'user.userId',
      'user.username',
      'user.isPro',
      'user.isAdmin',
    ])
    .getMany();

  return links;
}

async function linkBelongsToUser(linkId: string, userId: string): Promise<boolean> {
  const linkExists = await linkRepository
    .createQueryBuilder('link')
    .leftJoinAndSelect('link.user', 'user')
    .where({ link: { linkId } })
    .andWhere({ user: { userId } })
    .getExists();

  return linkExists;
}

async function deleteLinkById(linkId: string): Promise<void> {
  await linkRepository.createQueryBuilder('link').delete().where({ link: { linkId } }).execute();
}

export {
  getLinkById,
  createLinkId,
  createNewLink,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  linkBelongsToUser,
  deleteLinkById,
};
