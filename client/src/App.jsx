import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import CreateTask from './components/CreateTask/CreateTask';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [aulas, setAulas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [codigoIngreso, setCodigoIngreso] = useState('');
  const [currentView, setCurrentView] = useState('home');
  const [selectedAula, setSelectedAula] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchAulas();
    }
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = `${username.trim()}@aula.test`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Error al iniciar sesión: " + error.message);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = `${username.trim()}@aula.test`;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
       alert("Error al registrarse: " + error.message);
    } else {
       alert("Registro exitoso. Para que el inicio sea directo, asegúrate de desactivar 'Confirm email' en las opciones de Auth en Supabase!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAulas([]);
  };

  const fetchAulas = async () => {
    if (!supabase) return;
    
    // Obtenemos las aulas. Nota: en una app completada deberíamos traer las nuestras y a las que estamos unidos.
    // Por simplicidad, traemos todas y definimos cuáles somos dueños para probar (O crear RLS policies).
    const { data, error } = await supabase.from('aulas').select('*');
    if (!error && data) {
       setAulas(data.map(aula => ({
         ...aula,
         role: aula.creator_id === session.user.id ? 'docente' : 'estudiante'
       })));
    }
  };

  const handleAgregar = async () => {
    if (!nombre.trim()) return;
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (supabase) {
      const { data, error } = await supabase.from('aulas').insert([{ 
        nombre, 
        codigo, 
        creator_id: session.user.id 
      }]).select();
      
      if (error) {
        alert("Error al guardar: " + error.message);
      } else if (data && data.length > 0) {
        setAulas([...aulas, { ...data[0], role: 'docente' }]);
        setNombre('');
      } else {
        // En caso que no retorne data (sucede a veces según la política RLS)
        setAulas([...aulas, { nombre, codigo, creator_id: session.user.id, role: 'docente' }]);
        setNombre('');
      }
    }
  };

  const handleIngresar = async () => {
    if (!codigoIngreso.trim()) return;
    
    if (supabase) {
      const { data, error } = await supabase.from('aulas').select('*').eq('codigo', codigoIngreso).single();
      
      if (data) {
        // En base de datos real insertaríamos: insert({ aula_id: data.id, user_id: session.user.id }) a otra tabla
        setAulas([...aulas, { ...data, role: 'estudiante' }]);
        setCodigoIngreso('');
        alert('¡Te uniste existosamente a ' + data.nombre + '!');
      } else {
        alert('Código incorrecto o aula no encontrada.');
      }
    }
  };

  if (!session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'black' }}>
        <h2>Bienvenido al Gestor de Aulas Virtuales</h2>
        <div style={{ border: '1px solid #ccc', padding: '15px', background: '#f5f5f5', width: '300px' }}>
          <h3>Iniciar Sesión o Registrarse</h3>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '10px' }}>
              <label>Usuario:</label><br/>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Password:</label><br/>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" style={{ marginRight: '10px', background: '#1976d2', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Entrar</button>
            <button type="button" onClick={handleRegister} style={{ background: '#4CAF50', color: 'white', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Registrarse</button>
          </form>
        </div>
      </div>
    );
  }

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'black' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gestor de Aulas Virtuales</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Cuenta: {session.user.email ? session.user.email.replace('@aula.test', '') : 'Usuario'}</span>
          <button onClick={handleLogout} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Cerrar Sesión</button>
        </div>
      </div>
      
      {/* Panel 1: Ingreso Estudiante */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#e3f2fd' }}>
        <strong style={{ color: '#1565c0' }}>Estudiante: Ingresar a una Clase</strong><br/><br/>
        <label>Código de Invitación: </label>
        <input 
          type="text" 
          value={codigoIngreso} 
          onChange={(e) => setCodigoIngreso(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <button 
          onClick={handleIngresar} 
          style={{ background: '#1976d2', color: 'white', padding: '5px 15px', cursor: 'pointer', border: '1px solid #0d47a1' }}
        >
          Unirse
        </button>
      </div>

      {/* Panel 2: Creación Docente */}
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
          <tr style={{ background: '#e0e0e0', color: 'black' }}>
            <th>#</th>
            <th>Nombre del Aula</th>
            <th>Código de Invitación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {aulas.map((aula, index) => (
            <tr key={index} style={{ color: 'black' }}>
              <td>{index + 1}</td>
              <td>{aula.nombre} {aula.role === 'estudiante' ? '(Estudiante)' : '(Docente)'}</td>
              <td>{aula.codigo}</td>
              <td>
                {aula.role !== 'estudiante' ? (
                  <>
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
                  </>
                ) : (
                  <span style={{ color: '#666', fontStyle: 'italic' }}>Solo lectura</span>
                )}
              </td>
            </tr>
          ))}
          {aulas.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', color: 'black' }}>No hay aulas registradas.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;