const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existsUser = users.find(user => user.username === username);
  
  if(!existsUser) {
    return response.status(404).json({error: 'Usuário não encontrado'});
  }

  request.user = existsUser;
  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existsUser = users.find(user => user.username === username);
  
  if(existsUser) {
    return response.status(400).json({error: 'Usuário já existente'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users', (request, response) => {
    return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const existsTodo = user.todos.find(todo => todo.id === id);

  if(!existsTodo) {
    return response.status(404).json({ error: 'Tarefa não encontrada' });
  }

  existsTodo.title = title;
  existsTodo.deadline = deadline;

  return response.json(existsTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const existsTodo = user.todos.find(todo => todo.id === id);

  if(!existsTodo) {
    return response.status(404).json({ error: 'Tarefa não encontrada' });
  }

  existsTodo.done = true;

  return response.json(existsTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const existsTodo = user.todos.find(todo => todo.id === id);

  if(!existsTodo) {
    return response.status(404).json({ error: 'Tarefa não encontrada' });
  }

  user.todos.splice(existsTodo, 1);
  return response.status(204).send();
});

module.exports = app;