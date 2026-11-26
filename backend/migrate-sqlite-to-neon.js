require('dotenv').config();
const fs = require('fs');
const initSqlJs = require('sql.js');
const { Client } = require('pg');

const tables = ['users','folders','documents','activity','custom_presets','share_links','temp_files'];

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(new Uint8Array(fs.readFileSync('data/govdocs.sqlite')));
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    for (const table of tables) {
      const result = await client.query('SELECT COUNT(*)::int AS count FROM "' + table + '"');
      if (result.rows[0].count !== 0) {
        throw new Error('STOP: Neon table ' + table + ' is not empty. No data copied.');
      }
    }

    await client.query('BEGIN');

    let total = 0;

    for (const table of tables) {
      const columns = db.exec('PRAGMA table_info("' + table + '")')[0].values.map(row => row[1]);
      const result = db.exec('SELECT * FROM "' + table + '"');
      const rows = result.length ? result[0].values : [];

      if (rows.length) {
        const columnSql = columns.map(name => '"' + name + '"').join(',');
        const placeholders = columns.map((_, i) => '$' + (i + 1)).join(',');
        const insertSql = 'INSERT INTO "' + table + '" (' + columnSql + ') VALUES (' + placeholders + ')';

        for (const row of rows) {
          await client.query(insertSql, row);
          total++;
        }
      }

      console.log(table + ': copied ' + rows.length + ' records');
    }

    await client.query('COMMIT');
    console.log('MIGRATION SUCCESS. Total records copied:', total);

    for (const table of tables) {
      const result = await client.query('SELECT COUNT(*)::int AS count FROM "' + table + '"');
      console.log(table + ': Neon records = ' + result.rows[0].count);
    }
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.log('MIGRATION FAILED:', error.code || error.message);
    console.log('Any partial database changes were rolled back.');
  } finally {
    db.close();
    await client.end();
  }
})();
