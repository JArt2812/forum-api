/* eslint-disable no-underscore-dangle */
const AddOrDeleteLikeUseCase = require('../../../../Applications/use_case/AddOrDeleteLikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request) {
    const { id: owner } = request.auth.credentials;
    const thread = request.params.threadId;
    const comment = request.params.commentId;
    const addDeleteLikeUseCase = this._container.getInstance(AddOrDeleteLikeUseCase.name);
    await addDeleteLikeUseCase.execute({
      owner, thread, comment,
    });

    return {
      status: 'success',
    };
  }
}

module.exports = LikesHandler;
