const { Pool } = require('pg');

const pool = new Pool({
  host: 'ep-royal-bonus-a2woc16x.eu-central-1.pg.koyeb.app',
  database: 'koyebdb',
  user: 'koyeb-adm',
  password: 'npg_Gm5doH9bhRLF',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
