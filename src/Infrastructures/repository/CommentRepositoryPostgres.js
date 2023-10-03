const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

/* eslint-disable no-underscore-dangle */
class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, thread, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isDeleted = false;
    const query = {
      text: 'INSERT INTO threadscomments VALUES($1, $2, $3, $4, $5, $6) returning id, content, owner',
      values: [id, content, thread, owner, date, isDeleted],
    };

    const result = await this._pool.query(query);

    return new AddedComment(({ ...result.rows[0] }));
  }

  async checkAvailabilityComment(comment) {
    const query = {
      text: 'SELECT * FROM threadscomments WHERE id = $1',
      values: [comment],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('comment tidak ditemukan di database');
    }
  }

  async verifyCommentOwner(comment, owner) {
    const query = {
      text: 'SELECT * FROM threadscomments WHERE id = $1 AND owner = $2',
      values: [comment, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('anda tidak bisa mengakses comment orang lain.');
    }
  }

  async deleteComment(comment) {
    const query = {
      text: 'UPDATE threadscomments SET is_deleted = true WHERE id = $1',
      values: [comment],
    };
    await this._pool.query(query);
  }

  async getCommentsThread(thread) {
    const query = {
      text: `SELECT tc.id, tc.date, tc.content, tc.is_deleted, u.username
      FROM threadscomments tc LEFT JOIN users u
      ON u.id = tc.owner 
      WHERE tc.thread = $1 
      ORDER BY tc.date ASC`,
      values: [thread],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
