/* eslint-disable no-underscore-dangle */
const LikesRepository = require('../../Domains/likes/LikesRepository');

class LikeRepositoryPostgres extends LikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(comment, owner) {
    const id = `id-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, owner, comment],
    };

    await this._pool.query(query);
  }

  async checkAvailabilityLike(comment, owner) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment = $1 AND owner = $2',
      values: [comment, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) return true;

    return false;
  }

  async deleteLike(comment, owner) {
    const query = {
      text: 'DELETE FROM likes WHERE comment = $1 AND owner = $2',
      values: [comment, owner],
    };

    await this._pool.query(query);
  }

  async getLikes() {
    const result = await this._pool.query('SELECT * FROM likes');

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
