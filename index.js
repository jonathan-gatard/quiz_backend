const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

//MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'JonathanPassWorD',
  database: 'training',
});


//MIDDLEWARES
app.use(cors({
  origin: '*',
}));

app.use(express.json());


//API to GET group_id of user
app.get('/api/user-group/:uid', (req, res) => {
  const { uid } = req.params;

  let query =
    `SELECT
    training.users.id AS "user_id",
    training.users_groups.group_id AS "group_id",
    training.groups.group AS "group_name"
  FROM training.users
  JOIN training.users_groups ON users.id = users_groups.user_id
  JOIN training.groups ON users_groups.group_id = groups.id
  WHERE users.uid = ?`

  pool.query(query, [uid], (err, results, fields) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).send();
    }
    if (results.length === 0) {
      return res.status(204).send();
    }
    res.status(200).send(results);
  });
});


//API to GET data of quiz
app.get('/api/quiz-data/:userid/:quizid/:period', (req, res) => {
  const { userid, quizid, period } = req.params;
  let query = `
  SELECT
  training.quiz.id AS "quiz_id",
  training.results.result AS "quiz_result"
FROM
  training.quiz
LEFT JOIN
  training.results ON training.quiz.id = training.results.quiz_id
JOIN
  training.users_groups ON training.quiz.group_id = users_groups.group_id
JOIN
  training.users ON users_groups.user_id = users.id
WHERE
  users.id = ? AND training.quiz.id = ? AND training.results.period= ?
`;

  pool.query(query, [userid, quizid, period], (err, results, fields) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).send();
    }
    if (results.length === 0) {
      return res.status(204).send();
    }
    res.status(200).send(results);
  });
});

//API to GET infos of quiz
app.get('/api/quiz-infos/:groupid/:userid', (req, res) => {
  const { userid, groupid } = req.params;
  let query = `
  SELECT
  training.quiz.id AS "quiz_id",
  training.quiz.name AS "quiz_name",
  MAX(training.results.score) AS "quiz_score",
  MAX(training.results.timestamp) AS "quiz_timestamp"
FROM
  training.quiz
LEFT JOIN
  training.results ON training.quiz.id = training.results.quiz_id
JOIN
  training.users_groups ON training.quiz.group_id = users_groups.group_id
JOIN
  training.users ON users_groups.user_id = users.id
WHERE
  users.id = ? AND training.quiz.group_id = ?
GROUP BY
  training.quiz.id, training.quiz.name
`;

  pool.query(query, [userid, groupid], (err, results, fields) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).send();
    }
    if (results.length === 0) {
      return res.status(204).send();
    }
    res.status(200).send(results);
  });
});

//API to GET quiz questions
app.get('/api/quiz-questions/:quizid', (req, res) => {
  const { quizid } = req.params;
  let query = `
  SELECT content
  FROM training.quiz
  WHERE quiz.id=?`;

  pool.query(query, [quizid], (err, results, fields) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).send();
    }
    if (results.length === 0) {
      return res.status(204).send();
    }
    res.status(200).send(results);
  });
});

//API to POST result
app.post('/api/save', (req, res) => {
  const { user_id, quiz_id, score, result } = req.body;
  const timestamp = new Date();
  const period = new Date().toISOString().slice(0, 7).replace('-', '/');

  const query = `INSERT INTO results (user_id, quiz_id, timestamp, period, score, result) VALUES (?, ?, ?, ?, ?, ?);`;

  pool.query(
    query,
    [user_id, quiz_id, timestamp, period, score, JSON.stringify(result)],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de l'enregistrement du résultat :", err);
        return res.status(500).send();
      }
      res.status(200).send({ message: 'Résultat enregistré avec succès' });
    }
  );
});

//API to GET user history
app.get('/api/history/:uid', (req, res) => {
  const { uid } = req.params;
  let query = `
  SELECT
  users.id AS "user_id",
  users_groups.added AS "user_added",
  quiz.added AS "quiz_added",
  groups.id AS "group_id",
  groups.group AS "group",
  shops.id AS "shop_id",
  shops.shop AS "shop",
  quiz.id AS "quiz_id",
  quiz.name AS "quiz_name",
  results.score AS "score",
  results.period AS "period",
  results.result AS "result",
  results.timestamp AS "timestamp"
  FROM users
  JOIN training.users_groups ON users.id = users_groups.user_id
  JOIN training.groups ON users_groups.group_id = groups.id
  JOIN training.shops ON groups.shop_id = shops.id
  JOIN training.quiz ON groups.id = quiz.group_id
  LEFT JOIN training.results ON users.id = results.user_id AND quiz.id = results.quiz_id
  WHERE users.uid = ?;`

  pool.query(query, [uid], (err, results, fields) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête :", err);
      return res.status(500).send();
    }
    if (results.length === 0) {
      return res.status(204).send();
    }
    res.status(200).send(results);
  });
});

//SEERVER
app.listen(4000, () => {
  console.log('Serveur démarré sur le port 4000');
});
