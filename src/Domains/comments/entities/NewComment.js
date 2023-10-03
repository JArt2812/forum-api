/* eslint-disable no-underscore-dangle */
class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, thread, owner } = payload;

    this.content = content;
    this.thread = thread;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const { content, thread, owner } = payload;

    if (!content || !thread || !owner) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof thread !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
