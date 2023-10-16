const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
// const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  const userPayload = {
    id: 'user-123a',
    username: 'zaza',
  };

  const threadPayload = {
    id: 'thread-123a',
    body: 'sebuah thread',
    owner: 'user-123a',
  };

  const commentPayload = {
    id: 'comment-123a',
    content: 'a comment',
    thread: 'thread-123a',
    owner: 'user-123a',
  };

  const likePayload = {
    id: 'like-123',
    comment: 'comment-123a',
    owner: 'user-123a',
  };

  describe('addLike function', () => {
    it('should persist new like and return added like correctly', async () => {
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const fakeIdGenerator = () => '123a';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      await likeRepositoryPostgres.addLike(likePayload.comment, likePayload.owner);

      const likes = await LikesTableTestHelper.findLikesByCommentAndOwner(
        likePayload.comment,
        likePayload.owner,
      );
      expect(likes).toHaveLength(1);
    });
  });

  describe('checkAvailabilityLike function', () => {
    it('should be false if like available', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      const like = 'xxx';

      // Action & Assert
      const likes = await likeRepositoryPostgres.checkAvailabilityLike(like);
      expect(likes).toEqual(false);
    });

    it('should be true if like not available', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await LikesTableTestHelper.addLike(likePayload);

      // Action & Assert
      const likes = await likeRepositoryPostgres.checkAvailabilityLike(
        likePayload.comment,
        likePayload.owner,
      );
      expect(likes).toEqual(true);
    });
  });

  describe('deleteLike function', () => {
    it('should delete like by comment and owner correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await LikesTableTestHelper.addLike(likePayload);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      await likeRepositoryPostgres.deleteLike(likePayload.comment, likePayload.owner);

      // Assert
      const likes = await LikesTableTestHelper
        .findLikesByCommentAndOwner(likePayload.comment, likePayload.owner);
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikes function', () => {
    it('should get like count by comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await LikesTableTestHelper.addLike(likePayload);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const likeCount = await likeRepositoryPostgres.getLikes(likePayload.comment);

      // Assert
      expect(likeCount).toBeDefined();
      expect(likeCount).toHaveLength(1);
    });
  });
});
