/* eslint-disable no-underscore-dangle */

class DetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { thread: threadId } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);
    const thread = await this._threadRepository.getDetailThread(threadId);
    const comments = await this._commentRepository.getCommentsThread(threadId);
    const replies = await this._replyRepository.getReplyThread(threadId);

    const checkedComments = this._remappingComment(comments, replies);
    return {
      ...thread,
      comments: checkedComments,
    };
  }

  _remappingComment(comments, replies) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      replies: this._remappingReply(replies.filter((a) => a.comment === comment.id)),
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
    }));
  }

  _remappingReply(replies) {
    return replies.map((reply) => ({
      id: reply.id,
      content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
      date: reply.date,
      username: reply.username,
    }));
  }
}

module.exports = DetailThreadUseCase;
