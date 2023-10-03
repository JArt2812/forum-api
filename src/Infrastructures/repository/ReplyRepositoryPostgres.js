/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, comment, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isdeleted = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, comment, owner, date, isdeleted],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async checkAvailabilityReply(reply) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [reply],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('reply tidak ditemukan di database');
    }
  }

  async verifyReplyOwner(reply, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [reply, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('anda tidak bisa mengakses reply orang lain.');
    }
  }

  async deleteReply(reply) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [reply],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async getReplyThread(thread) {
    const query = {
      text: `SELECT r.id, r.date, r.content, r.is_deleted, u.username, r.comment
      FROM replies r
      LEFT JOIN users u ON u.id = r.owner
      LEFT JOIN threadscomments tc ON r.comment = tc.id
      WHERE tc.thread = $1 
      ORDER BY r.date ASC`,
      values: [thread],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ReplyRepositoryPostgres;
