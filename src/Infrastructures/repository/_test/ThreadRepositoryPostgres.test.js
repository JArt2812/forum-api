const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });
  const userPayload = {
    id: 'user-123',
    username: 'zaza',
  };
  const addedThreadPayload = {
    id: 'thread-123',
    title: 'a thread',
    owner: 'user-123',
  };
  describe('addThread function', () => {
    const newThreadPayload = {
      title: 'a thread',
      body: 'secret',
      owner: 'user-123',
    };
    it('should persist new thread and return added thread correctly', async () => {
      await UsersTableTestHelper.addUser(userPayload);

      const newThread = new NewThread(newThreadPayload);

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(addedThread).toStrictEqual(new AddedThread(addedThreadPayload));
      expect(thread).toHaveLength(1);
    });
  });

  describe('checkAvailabilityThread function', () => {
    it('should throw NotFoundError if thread not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadId = 'xxx';

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError if thread available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(addedThreadPayload);

      // Action & Assert
      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123'))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should get detail thread', async () => {
      const threadRepository = new ThreadRepositoryPostgres(pool, {});
      const threadPayload = {
        id: 'thread-123',
        title: 'a thread title',
        body: 'a thread',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(threadPayload);

      const detailThread = await threadRepository.getDetailThread(threadPayload.id);

      expect(detailThread.id).toEqual(threadPayload.id);
      expect(detailThread.title).toEqual(threadPayload.title);
      expect(detailThread.body).toEqual(threadPayload.body);
      expect(detailThread.username).toEqual(userPayload.username);
    });
  });
});
