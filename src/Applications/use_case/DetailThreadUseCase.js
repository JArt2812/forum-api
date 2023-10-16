/* eslint-disable no-underscore-dangle */

class DetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const { thread: threadId } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);
    const thread = await this._threadRepository.getDetailThread(threadId);
    const comments = await this._commentRepository.getCommentsThread(threadId);
    const replies = await this._replyRepository.getReplyThread(threadId);
    const like = await this._likeRepository.getLikes();
    const checkedComments = await this._remappingComment(comments, replies, like);

    return {
      ...thread,
      comments: checkedComments,
    };
  }

  async _remappingComment(comments, replies, like) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      replies: this._remappingReply(replies.filter((a) => a.comment === comment.id)),
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
      likeCount: like.filter((a) => a.comment === comment.id).length,
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
