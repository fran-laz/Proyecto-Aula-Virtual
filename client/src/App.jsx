import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [aulas, setAulas] = useState([]);
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    fetchAulas();
  }, []);

  const fetchAulas = async () => {
    if (!supabase) {
      // Mock para cuando no hayan puesto credenciales reales en .env
      setAulas([{ id: 1, nombre: 'Base de Datos (MOCK)', codigo: 'BD123' }]);
      return;
    }
    const { data, error } = await supabase.from('aulas').select('*');
    if (!error && data) {
      setAulas(data);
    }
  };

  const handleAgregar = async () => {
    if (!nombre.trim()) return;
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Optimistic UI o mock mode
    const newAula = { nombre, codigo };
    setAulas([...aulas, newAula]);
    setNombre('');

    if (supabase) {
      const { error } = await supabase.from('aulas').insert([newAula]);
      if (error) console.error(error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gestor de Aulas Virtuales</h2>
      
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#f5f5f5' }}>
        <strong>Datos del Aula</strong><br/><br/>
        <label>Nombre del Aula: </label>
        <input 
          type="text" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        
        <button 
          onClick={handleAgregar} 
          style={{ background: '#4CAF50', color: 'white', padding: '5px 15px', cursor: 'pointer', border: '1px solid #388E3C' }}
        >
          Agregar Nueva
        </button>
      </div>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e0e0e0' }}>
            <th>#</th>
            <th>Nombre del Aula</th>
            <th>Código de Invitación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map((aula, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{aula.nombre}</td>
              <td>{aula.codigo}</td>
              <td>
                <button style={{ background: '#f44336', color: 'white', border: '1px solid #d32f2f', cursor: 'pointer' }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {aulas.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No hay aulas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;