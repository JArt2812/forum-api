/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'a comment', thread = 'thread-123', owner = 'user-123', date = '2023', isDeleted = false,
  }) {
    const query = {
      text: 'INSERT INTO threadscomments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, thread, owner, date, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM threadscomments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async checkDeletedCommentsById(id) {
    const query = {
      text: 'SELECT is_deleted FROM threadscomments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const isDeleted = result.rows[0].is_deleted;
    return isDeleted;
  },

  async deleteComment(id) {
    const query = {
      text: 'UPDATE threadscomments SET is_deleted = 1 WHERE id = $1',
      values: [id],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM threadscomments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
