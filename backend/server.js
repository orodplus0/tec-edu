const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');

// Importar Models
const Room = require('./models/Room');
const Question = require('./models/Question');

// Configuração do App
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Em produção, mude para o endereço do seu frontend
    methods: ["GET", "POST"]
  }
});

// Conexão com MongoDB (use sua string de conexão)
const MONGO_URI = "mongodb+srv://<gersondasilva2_db_user>:<lvdqKA7E4QwnZJ58>@orodplus...mongodb.net/?retryWrites=true&w=majority"; // SUBSTITUA PELA SUA STRING DE CONEXÃO
mongoose.connect(MONGO_URI).then(() => console.log("MongoDB conectado")).catch(err => console.log(err));

// --- API Endpoints ---

// Criar uma nova sala
app.post('/api/rooms', async (req, res) => {
  try {
    const newRoom = new Room({ name: req.body.name });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar sala." });
  }
});

// Validar código da sala
app.get('/api/rooms/:code', async (req, res) => {
    try {
        const room = await Room.findOne({ code: req.params.code });
        if (!room) {
            return res.status(404).json({ message: 'Sala não encontrada.' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
});


// --- Lógica do Socket.IO ---

io.on('connection', (socket) => {
  console.log('Um usuário conectou:', socket.id);

  // Aluno entra em uma sala
  socket.on('joinRoom', async (roomCode) => {
    socket.join(roomCode);
    console.log(`Usuário ${socket.id} entrou na sala ${roomCode}`);
    
    // Enviar perguntas existentes para o usuário que acabou de entrar
    const questions = await Question.find({ roomCode }).sort({ createdAt: 1 });
    socket.emit('loadQuestions', questions);
  });

  // Receber nova pergunta de um aluno
  socket.on('newQuestion', async (data) => {
    const { roomCode, content } = data;
    const question = new Question({ roomCode, content });
    await question.save();
    
    // Enviar a nova pergunta para todos na sala (incluindo o professor)
    io.to(roomCode).emit('questionPosted', question);
  });

  // Professor marca pergunta como respondida
  socket.on('markAsAnswered', async (questionId) => {
      const question = await Question.findByIdAndUpdate(questionId, { isAnswered: true }, { new: true });
      if(question) {
          io.to(question.roomCode).emit('questionUpdated', question);
      }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectou:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
