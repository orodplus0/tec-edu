import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Endereço do seu backend

const StudentView = ({ roomCode }) => {
  const [question, setQuestion] = useState('');
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

  const sendQuestion = () => {
    if (question.trim()) {
      socket.emit('newQuestion', { roomCode, content: question });
      setQuestion('');
    }
  };

  return (
    <div className="container">
      <h2>Sala de Aula (Código: {roomCode})</h2>
      <div className="question-form">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Digite sua pergunta anonimamente aqui..."
        />
        <button onClick={sendQuestion}>Enviar Pergunta</button>
      </div>
      <div className="questions-list student">
         <h3>Perguntas da Turma</h3>
         {questions.map((q) => (
          <div key={q._id} className={`question-card ${q.isAnswered ? 'answered' : ''}`}>
            <p>{q.content}</p>
            <span>{q.isAnswered ? 'Respondida' : 'Pendente'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentView;
