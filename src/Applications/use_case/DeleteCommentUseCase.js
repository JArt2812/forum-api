/* eslint-disable no-underscore-dangle */
class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { thread, comment, owner } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);
    await this._commentRepository.verifyCommentOwner(comment, owner);
    await this._commentRepository.deleteComment(comment);
  }
}

module.exports = DeleteCommentUseCase;
