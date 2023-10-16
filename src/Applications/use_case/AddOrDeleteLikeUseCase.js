/* eslint-disable no-underscore-dangle */
class AddOrLikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { thread, comment, owner } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);
    const isLikeExist = await this._likeRepository
      .checkAvailabilityLike(comment, owner);
    if (isLikeExist) {
      await this._likeRepository.deleteLike(comment, owner);
    } else {
      await this._likeRepository.addLike(comment, owner);
    }
  }
}

module.exports = AddOrLikeUseCase;
