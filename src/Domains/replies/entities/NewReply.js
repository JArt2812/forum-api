/* eslint-disable no-underscore-dangle */
class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, comment, owner } = payload;

    this.content = content;
    this.comment = comment;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const { content, comment, owner } = payload;

    if (!content || !comment || !owner) {
      throw new Error('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof comment !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewReply;
