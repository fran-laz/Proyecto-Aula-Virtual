import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CreateTask from './components/CreateTask/CreateTask';
import './App.css';

function App() {
  const [aulas, setAulas] = useState([]);
  const [nombre, setNombre] = useState('');
  
  // Estado para la nueva funcionalidad (HU 2)
  const [codigoIngreso, setCodigoIngreso] = useState('');

  // Estado de vista
  const [currentView, setCurrentView] = useState('home');
  const [selectedAula, setSelectedAula] = useState(null);

  useEffect(() => {
    fetchAulas();
  }, []);

  const fetchAulas = async () => {
    if (!supabase) {
      setAulas([{ id: 1, nombre: 'Ingeniería de Software (MOCK)', codigo: '12345' }]);
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
    
    const newAula = { nombre, codigo };
    setAulas([...aulas, newAula]);
    setNombre('');

    if (supabase) {
      const { error } = await supabase.from('aulas').insert([newAula]);
      if (error) console.error(error);
    }
  };

  // Función para HU 2: Estudiante entra a clase
  const handleIngresar = () => {
    if (codigoIngreso.trim() === '12345') {
      alert('¡Ingreso exitoso! Te has unido a la clase: Ingeniería de Software');
      setCodigoIngreso('');
    } else if (codigoIngreso.trim().length > 0) {
      alert('Código incorrecto. Intenta probando con el código de prueba: 12345');
    }
  };

  if (currentView === 'createTask') {
    return (
      <CreateTask 
        aula={selectedAula}
        onCancel={() => {
          setCurrentView('home');
          setSelectedAula(null);
        }} 
        onTaskCreated={(tarea) => {
          alert(`Tarea "${tarea.titulo}" creada correctamente${selectedAula ? ` para la clase ${selectedAula.nombre}` : ''}.`);
          setCurrentView('home');
          setSelectedAula(null);
        }} 
      />
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gestor de Aulas Virtuales</h2>
      
      {/* Panel 1: Ingreso Estudiante (HU 2) */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#e3f2fd' }}>
        <strong style={{ color: '#1565c0' }}>Estudiante: Ingresar a una Clase</strong><br/><br/>
        <label>Código de Invitación: </label>
        <input 
          type="text" 
          value={codigoIngreso} 
          onChange={(e) => setCodigoIngreso(e.target.value)} 
          style={{ marginRight: '10px' }}
          placeholder="Escribe 12345 para probar"
        />
        <button 
          onClick={handleIngresar} 
          style={{ background: '#1976d2', color: 'white', padding: '5px 15px', cursor: 'pointer', border: '1px solid #0d47a1' }}
        >
          Unirse
        </button>
      </div>

      {/* Panel 2: Creación Docente (HU 0) */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#f5f5f5' }}>
        <strong>Docente: Crear Nueva Clase</strong><br/><br/>
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
                <button 
                  onClick={() => {
                    setSelectedAula(aula);
                    setCurrentView('createTask');
                  }}
                  style={{ background: '#2196F3', color: 'white', border: '1px solid #1976D2', cursor: 'pointer', marginRight: '8px', padding: '4px 8px', borderRadius: '4px' }}
                >
                  Crear Tarea
                </button>
                <button style={{ background: '#f44336', color: 'white', border: '1px solid #d32f2f', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>
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