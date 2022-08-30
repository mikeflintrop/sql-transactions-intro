const express = require('express');
const router = express.Router();

const pool = require('../modules/pool');

router.get('/', (req, res) => {
  // res.send('Hello?');
  const sqlText = `
    SELECT "account"."name", SUM("register"."amount")
    FROM "account"
    JOIN "register" ON "account"."id" = "register"."acct_id"
    GROUP BY "account"."name" 
    ORDER BY "account"."name";
  `;
  pool.query(sqlText)
    .then(result => {
      console.log('Money numbers:', result.rows);
      res.send(result.rows);
    })
    .catch(error => {
      console.log('Error moving money:', error);
      res.sendStatus(500)
    });
});

router.post('/transfer', async (req, res) => {
  const toId = req.body.toId;
  const fromId = req.body.fromId;
  const amount = req.body.amount;
  console.log(`Transferring ${amount} to ${toId} from ${fromId}`);

  const connection = await pool.connect();

  try {
    await connection.query('BEGIN');
    const sqlText = 'INSERT INTO "register" ("acct_id", "amount") VALUES ($1, $2);';
    await connection.query(sqlText, [fromId, -amount]);
    await connection.query(sqlText, [toId, amount]);
    await connection.query('COMMIT');
    res.sendStatus(200);
  }
  catch (error) {
    await connection.query('ROLLBACK');
    console.log('Error:', error);
    res.sendStatus(500);
  }
  finally {
    connection.release();
  };
});

module.exports = router;
