const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server runs");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initialize();

const statusandpriority = (requestquery) => {
  return (
    requestquery["status"] !== undefined &&
    requestquery["priority"] !== undefined
  );
};

const statusfunc = function (requestquery) {
  return requestquery["status"] !== undefined;
};

const priorityfunc = (requestquery) => {
  return requestquery["priority"] !== undefined;
};

const todofunc = (body) => {
  return body.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  let query = ``;
  const { search_q = "", status, priority } = request.query;
  switch (true) {
    case statusandpriority(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority= '${priority}'`;
      break;

    case statusfunc(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}'`;
      break;
    case priorityfunc(request.query):
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}'`;
      break;
    default:
      query = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
  }
  console.log(query);
  const details = await db.all(query);
  console.log(details);
  response.send(details);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id=${todoId}`;
  const details = await db.get(query);
  response.send(details);
});

app.post("/todos/", async (request, response) => {
  const body = request.body;
  const { id, todo, priority, status } = body;
  const query = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},"${todo}","${priority}","${status}")`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const body = request.body;
  const { todo, status, priority } = body;
  let query = ``;
  let responsemsg = "";
  switch (true) {
    case statusfunc(body):
      query = `UPDATE todo SET status = "${status}" WHERE id = ${todoId}`;
      responsemsg = "Status Updated";
      break;
    case priorityfunc(body):
      query = `UPDATE todo SET priority = "${priority}" WHERE id = ${todoId}`;
      responsemsg = "Priority Updated";
      break;
    case todofunc(body):
      query = `UPDATE todo SET todo = "${todo}" WHERE id = ${todoId}`;
      responsemsg = "Todo Updated";
      break;
  }
  await db.run(query);
  response.send(responsemsg);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id= ${todoId}`;
  await db.run(query);
  response.send("Todo Deleted");
});
module.exports = app;
