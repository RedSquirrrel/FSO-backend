const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.json());

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

const generateID = () => {
  const id = Math.floor(Math.random() * 1000000);
  return id;
};

app.get('/info', (request, response) => {
  response.send(`<div>Phonebook has info for ${persons.length} people </div> <div>${new Date()}</div>`);
});

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  const person = persons.find(p => p.id === Number(id));
  if (person) {
    response.json(person);
  } else {
    return response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  persons = persons.filter(p => p.id !== Number(id));

  response.status(204).end();
});

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status  :res[content-length] - :response-time ms :body'));

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Missing name or number',
    });
  }

  const findPerson = persons.map(p => p.name.toLowerCase() === body.name.toLowerCase());

  if (findPerson.find(p => p === true)) {
    return response.status(400).json({
      error: 'Name must be unique',
    });
  }

  const person = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
