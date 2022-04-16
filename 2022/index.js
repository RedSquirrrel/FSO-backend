require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

const Person = require('./models/person');

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

app.use(requestLogger);

app.get('/info', (request, response) => {
  Person.find({}).then(resp => {
    response.send(`<div>Phonebook has info for ${resp.length} people </div> <div>${new Date()}</div>`);
  });
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        return response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id).then(result => {
    if (!result) {
      return response.status(400).end();
    }
    response.status(204).end();
  });
});

morgan.token('body', function (req, res) {
  console.log(res);
  return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status  :res[content-length] - :response-time ms :body'));

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Missing name or number',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  Person.find({ name: body.name }).exec(function (err, track) {
    console.log('POSTTTTT:', track);
    if (track.length) {
      return response.status(400).json({
        error: 'Name must be unique',
      });
    }

    person
      .save()
      .then(savedPerson => {
        response.json(savedPerson);
      })
      .catch(error => next(error));
  });
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (!updatedPerson) {
        return response.status(400).end();
      }
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

const unknowEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown Endpoint' });
};

app.use(unknowEndpoint);

const errorHandler = (err, request, response, next) => {
  if (err.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' });
  }
  if (err.name === 'ValidationError') {
    return response.status(400).json({ error: err.message });
  }
  next(err);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
