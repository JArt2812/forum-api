const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (request, h) => handler.postRepliesHandler(request, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (request) => handler.deleteReplyHandler(request),
    options: {
      auth: 'forumapi_jwt',
    },
  },
]);

module.exports = routes;
