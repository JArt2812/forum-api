/* eslint-disable no-underscore-dangle */
class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      thread, comment, reply, owner,
    } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    await this._commentRepository.checkAvailabilityComment(comment);
    await this._replyRepository.checkAvailabilityReply(reply);
    await this._replyRepository.verifyReplyOwner(reply, owner);
    await this._replyRepository.deleteReply(reply);
  }
}

module.exports = DeleteReplyUseCase;
