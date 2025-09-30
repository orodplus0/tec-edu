import React, 'react';
import { useState } from 'react';
import axios from 'axios';
import ProfessorView from './components/ProfessorView';
import StudentView from './components/StudentView';
import './App.css';

// Configuração do Axios para se comunicar com o backend
const api = axios.create({
  baseURL: 'http://localhost:4000/api' // Endereço do seu backend
});

function App() {
  const [view, setView] = useState('home'); // 'home', 'professor', 'student'
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName) {
      setError('Por favor, dê um nome para a sala.');
      return;
    }
    try {
      const res = await api.post('/rooms', { name: roomName });
      setRoomCode(res.data.code);
      setView('professor');
      setError('');
    } catch (err) {
      setError('Não foi possível criar a sala.');
    }
  };

  const handleJoinRoom = async () => {
    if(!roomCode){
      setError('Por favor, insira um código.');
      return;
    }
    try {
        await api.get(`/rooms/${roomCode}`);
        setView('student');
        setError('');
    } catch (err) {
        setError('Código da sala inválido.');
    }
  }

  if (view === 'professor') {
    return <ProfessorView roomCode={roomCode} roomName={roomName} />;
  }

  if (view === 'student') {
    return <StudentView roomCode={roomCode} />;
  }

  return (
    <div className="container home-container">
      <h1>Bem-vindo à Sala Segura</h1>
      {error && <p className="error-message">{error}</p>}
      
      <div className="card">
        <h2>Para Professores</h2>
        <input 
          type="text" 
          placeholder="Nome da aula (ex: Cálculo I)" 
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Criar Sala</button>
      </div>

      <div className="card">
        <h2>Para Alunos</h2>
        <input 
          type="text" 
          placeholder="Código da sala"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.trim())}
        />
        <button onClick={handleJoinRoom}>Entrar na Sala</button>
      </div>
    </div>
  );
}

export default App;
