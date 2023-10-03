const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
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

  const newCommentPayload = {
    content: 'sebuah comment',
    thread: 'thread-123a',
    owner: 'user-123a',
  };

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      const newComment = new NewComment(newCommentPayload);

      const fakeIdGenerator = () => '123a';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      const comment = await CommentsTableTestHelper.findCommentsById('comment-123a');
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123a',
        content: 'sebuah comment',
        owner: 'user-123a',
      }));
      expect(comment).toHaveLength(1);
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError if comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = 'xxx';

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment(comment))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if comment available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123a'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if comment not belong to owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await UsersTableTestHelper.addUser({ id: 'user-123b', username: 'azaz' });
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123a', 'user-123b'))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if comment is belongs to owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123a', 'user-123a'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment from database', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Action
      await commentRepositoryPostgres.deleteComment('comment-123a');

      // Assert
      const comment = await CommentsTableTestHelper
        .checkDeletedCommentsById('comment-123a');
      expect(comment).toEqual(true);
    });
  });

  describe('getCommentsThread', () => {
    it('should get comments of thread', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);
      await CommentsTableTestHelper.addComment(commentPayload);

      // Assert
      const comments = await commentRepositoryPostgres.getCommentsThread(threadPayload.id);
      expect(Array.isArray(comments)).toBe(true);
      expect(comments[0].id).toEqual(commentPayload.id);
      expect(comments[0].username).toEqual(userPayload.username);
      expect(comments[0].content).toEqual('a comment');
      expect(comments[0].date).toBeDefined();
    });
  });
});
