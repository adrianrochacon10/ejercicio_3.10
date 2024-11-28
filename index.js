const express = require("express");
const app = express();
app.use(express.json());

//Esto ayudara a comunicarse con un servicio externo
const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

const morgan = require("morgan");

app.use(morgan("tiny"));

morgan.token("req-body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

//Manda mensajes de las peticiones que se realizan en nuestro back a través de la consola
app.use(
  morgan(":method :url :res[content-length] - :response-time ms :req-body")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  {
    id: 5,
    name: "a",
    number: "6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === "") {
    return response.status(400).json({
      error: "Nombre vacio",
    });
  }
  if (body.number === "") {
    return response.status(400).json({
      error: "Numero vacio",
    });
  }
  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "Nombre ya existente",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.get("/info", (request, response) => {
  let date = new Date();
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p> <br/> <p>${date}</p>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

//Este puerto es nuestro servidor backend
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
