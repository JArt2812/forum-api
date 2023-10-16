const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikesRepository = require('../../../Domains/likes/LikesRepository');
const AddOrLikeUseCase = require('../AddOrDeleteLikeUseCase');

describe('AddLikeUseCase', () => { // if like DOES NOT exist
  const useCasePayload = {
    thread: 'thread-123',
    comment: 'comment-123',
    owner: 'user-123',
  };
  it('should orchestrating the add like action correctly ', async () => {
    // Arrange

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikesRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkAvailabilityLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addLikeUseCase = new AddOrLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.comment);
    expect(mockLikeRepository.checkAvailabilityLike)
      .toBeCalledWith(useCasePayload.comment, useCasePayload.owner);
    expect(mockLikeRepository.addLike)
      .toBeCalledWith(useCasePayload.comment, useCasePayload.owner);
  });

  it('should orchestrating the delete like action correctly if like DOES already exist', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikesRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.checkAvailabilityLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true)); // like already exist
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addDeleteLikeUseCase = new AddOrLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await addDeleteLikeUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith(useCasePayload.comment);
    expect(mockLikeRepository.checkAvailabilityLike)
      .toBeCalledWith(useCasePayload.comment, useCasePayload.owner);
    expect(mockLikeRepository.deleteLike)
      .toBeCalledWith(useCasePayload.comment, useCasePayload.owner);
  });
});
