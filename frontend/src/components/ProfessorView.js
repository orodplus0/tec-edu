import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Endereço do seu backend

const ProfessorView = ({ roomCode, roomName }) => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    socket.emit('joinRoom', roomCode);

    socket.on('loadQuestions', (loadedQuestions) => {
      setQuestions(loadedQuestions);
    });

    socket.on('questionPosted', (newQuestion) => {
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
    });

    socket.on('questionUpdated', (updatedQuestion) => {
        setQuestions((prevQuestions) => 
            prevQuestions.map(q => q._id === updatedQuestion._id ? updatedQuestion : q)
        );
    });

    return () => socket.disconnect();
  }, [roomCode]);

  const markAsAnswered = (id) => {
    socket.emit('markAsAnswered', id);
  }

  return (
    <div className="container">
      <h2>Sala do Professor: {roomName}</h2>
      <p className="room-code">Compartilhe o código: <strong>{roomCode}</strong></p>
      <div className="questions-list">
        <h3>Perguntas Recebidas</h3>
        {questions.length === 0 && <p>Aguardando perguntas dos alunos...</p>}
        {questions.map((q) => (
          <div key={q._id} className={`question-card ${q.isAnswered ? 'answered' : ''}`}>
            <p>{q.content}</p>
            {!q.isAnswered && (
                <button onClick={() => markAsAnswered(q._id)}>Marcar como Respondida</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessorView;
