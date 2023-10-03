const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
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
    thread: 'thread-123a',
    owner: 'user-123a',
  };

  const replyPayload = {
    content: 'a reply',
    comment: 'comment-123a',
    owner: 'user-123a',
  };

  describe('AddReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      const newReply = new NewReply(replyPayload);

      const fakeIdGenerator = () => '123a';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const addedReply = await replyRepositoryPostgres.addReply(newReply);
      const reply = await RepliesTableTestHelper.findRepliesById('reply-123a');
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123a',
        content: 'a reply',
        owner: 'user-123a',
      }));
      expect(reply).toHaveLength(1);
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.checkAvailabilityReply('xxx'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply found', async () => {
      // Arrange
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.checkAvailabilityReply(replyId))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw UnauthorizedError when provided userId is not the reply owner', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should throw NotFoundError when reply not found', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(replyRepositoryPostgres.deleteReply('xxx'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete reply by id and return success correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe('getReplyThread', () => {
    it('should get reply of comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);
      await RepliesTableTestHelper.addReply(replyPayload);

      // Assert
      const replies = await commentRepositoryPostgres.getReplyThread(threadPayload.id);
      expect(Array.isArray(replies)).toBe(true);
      expect(replies[0].id).toEqual('reply-123');
      expect(replies[0].username).toEqual(userPayload.username);
      expect(replies[0].content).toEqual('a reply');
      expect(replies[0].date).toBeDefined();
    });
  });
});
