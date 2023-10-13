const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'a thread',
      body: 'a body thread',
      date: '2023',
      username: 'zaza',
    };

    const expectedComment = [
      {
        id: 'comment-123a',
        username: 'zaza',
        date: '2023',
        content: 'a comment',
        is_deleted: 0,
      },
      {
        id: 'comment-123b',
        username: 'zaza',
        date: '2022',
        content: 'a comment',
        is_deleted: 1,
      },
    ];
    const expectedReply = [
      {
        id: 'reply-123a',
        username: 'zaza',
        date: '2023',
        content: 'a reply',
        is_deleted: 0,
        comment: 'comment-123a',
      },
      {
        id: 'reply-123b',
        username: 'zaza',
        date: '2022',
        content: 'a reply',
        is_deleted: 1,
        comment: 'comment-123a',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockReplyRepository.getReplyThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReply));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getDetailThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.getCommentsThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockReplyRepository.getReplyThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(detailThread).toStrictEqual(
      {
        id: 'thread-123',
        title: 'a thread',
        body: 'a body thread',
        date: '2023',
        username: 'zaza',
        comments: [
          {
            id: 'comment-123a',
            username: 'zaza',
            date: '2023',
            content: 'a comment',
            replies: [
              {
                id: 'reply-123a',
                username: 'zaza',
                date: '2023',
                content: 'a reply',
              },
              {
                id: 'reply-123b',
                username: 'zaza',
                date: '2022',
                content: '**balasan telah dihapus**',
              },
            ],
          },
          {
            id: 'comment-123b',
            username: 'zaza',
            date: '2022',
            content: '**komentar telah dihapus**',
            replies: [],
          },
        ],
      },
    );
  });
});
