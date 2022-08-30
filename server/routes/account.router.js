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
})


module.exports = router;
