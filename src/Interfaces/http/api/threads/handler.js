/* eslint-disable no-underscore-dangle */
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner,
    };
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request) {
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
    const useCasePayload = {
      thread: request.params.threadId,
    };
    const thread = await detailThreadUseCase.execute(useCasePayload);
    // console.log(thread);
    return {
      status: 'success',
      data: { thread },
    };
  }
}

module.exports = ThreadsHandler;
