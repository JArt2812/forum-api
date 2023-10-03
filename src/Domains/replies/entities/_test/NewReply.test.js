const NewReply = require('../NewReply');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      comment: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: true,
      comment: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new reply object correctly', () => {
    const payload = {
      content: 'a reply',
      comment: 'comment-123',
      owner: 'user-123',
    };

    const { content, thread, owner } = new NewReply(payload);

    expect(content).toEqual(payload.content);
    expect(thread).toEqual(payload.thread);
    expect(owner).toEqual(payload.owner);
  });
});
