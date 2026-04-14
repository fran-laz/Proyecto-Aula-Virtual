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
  const [activeTab, setActiveTab] = useState('estudiante');

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
    if (error) alert("Usuario o contraseña incorrectos.");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const email = `${username.trim()}@aula.test`;
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { data: { nombre: username.trim() } }
    });
    
    if (error) {
       alert("Error al registrarse: " + error.message);
    } else {
       if (data?.user) {
         // Insertamos el usuario en la tabla "perfiles" para cumplir la llave foránea
         const { error: perfilError } = await supabase.from('perfiles').insert([{
           id: data.user.id,
           nombre: username.trim()
           // rol se asignará según cómo tengas configurada tu tabla
         }]);
         
         if (perfilError) {
           console.error("Error guardando perfil:", perfilError);
         }
       }
       alert("¡Registro exitoso! Entrando...");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAulas([]);
  };

  const fetchAulas = async () => {
    if (!supabase || !session?.user?.id) return;
    
    // 1. Aulas que el usuario creó (Docente)
    const { data: misAulas, error: errMisAulas } = await supabase
      .from('aulas')
      .select('*')
      .eq('creador_id', session.user.id);
      
    // 2. Aulas a las que se unió (Estudiante)
    const { data: uniones, error: errUniones } = await supabase
      .from('aula_estudiantes')
      .select('aulas(*)')
      .eq('estudiante_id', session.user.id);

    let listado = [];

    if (!errMisAulas && misAulas) {
       listado = [...listado, ...misAulas.map(a => ({ ...a, role: 'docente' }))];
    }
    
    if (!errUniones && uniones) {
       // Filter out any potential nulls if a referenced aula was deleted but the cascade didn't run or something unexpected
       const unidas = uniones.map(u => ({ ...u.aulas, role: 'estudiante' })).filter(a => a && a.id);
       listado = [...listado, ...unidas];
    }
    
    setAulas(listado);
  };

  const handleAgregar = async () => {
    if (!nombre.trim()) return;
    const codigo_invitacion = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (supabase) {
      const { data, error } = await supabase.from('aulas').insert([{ 
        nombre, 
        codigo_invitacion, 
        creador_id: session.user.id 
      }]).select();
      
      if (error) {
        alert("Error al guardar: " + error.message);
      } else if (data && data.length > 0) {
        setAulas([...aulas, { ...data[0], role: 'docente' }]);
        setNombre('');
      } else {
        setAulas([...aulas, { nombre, codigo_invitacion, creador_id: session.user.id, role: 'docente' }]);
        setNombre('');
      }
    }
  };

  const handleIngresar = async () => {
    if (!codigoIngreso.trim()) return;
    
    if (supabase && session?.user?.id) {
      const codigoBuscado = codigoIngreso.trim().toUpperCase();
      const { data, error } = await supabase.from('aulas').select('*').eq('codigo_invitacion', codigoBuscado).single();
      
      if (data) {
        if (data.creador_id === session.user.id) {
           alert('No puedes unirte como estudiante a una clase que tú creaste.');
           setCodigoIngreso('');
           return;
        }

        const yaUnido = aulas.find(a => a.id === data.id);
        if (yaUnido) {
          alert('Ya estás unido a esta clase.');
          setCodigoIngreso('');
          return;
        }

        // Guardar la inscripción en la base de datos
        const { error: insertError } = await supabase
           .from('aula_estudiantes')
           .insert([{ aula_id: data.id, estudiante_id: session.user.id }]);

        if (insertError) {
           // Código 23505 es violación de llave única (unique constraint)
           if (insertError.code === '23505') {
               alert('Ya estabas registrado en esta clase en la base de datos.');
               fetchAulas(); // Refrescar por si acaso
           } else {
               alert('Error al guardar tu inscripción: ' + insertError.message);
               return;
           }
        } else {
           setAulas([...aulas, { ...data, role: 'estudiante' }]);
        }
        
        setCodigoIngreso('');
        alert('¡Te uniste exitosamente a ' + data.nombre + '!');
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
      
      {/* Pestañas de Navegación */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
         <button 
           onClick={() => setActiveTab('estudiante')}
           style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'estudiante' ? '#1976d2' : '#e0e0e0', color: activeTab === 'estudiante' ? 'white' : 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
         >
           👨‍🎓 Vista de Estudiante
         </button>
         <button 
           onClick={() => setActiveTab('docente')}
           style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'docente' ? '#4CAF50' : '#e0e0e0', color: activeTab === 'docente' ? 'white' : 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
         >
           👨‍🏫 Vista de Docente
         </button>
      </div>

      {activeTab === 'estudiante' && (
        <>
          {/* Panel: Ingreso Estudiante */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
            <strong style={{ color: '#1565c0', fontSize: '1.1em' }}>Unirse a una Clase Nueva</strong><br/><br/>
            <label>Código de Invitación: </label>
            <input 
              type="text" 
              value={codigoIngreso} 
              onChange={(e) => setCodigoIngreso(e.target.value)} 
              style={{ marginRight: '10px', padding: '5px' }}
              placeholder="Ej. A1B2C"
            />
            <button 
              onClick={handleIngresar} 
              style={{ background: '#1976d2', color: 'white', padding: '6px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}
            >
              Unirse
            </button>
          </div>

          <h3 style={{ marginTop: '30px' }}>Mis Clases Inscritas</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
            <thead>
              <tr style={{ background: '#e0e0e0', color: 'black' }}>
                <th>#</th>
                <th>Nombre del Aula</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aulas.filter(a => a.role === 'estudiante').map((aula, index) => (
                <tr key={index} style={{ color: 'black' }}>
                  <td>{index + 1}</td>
                  <td>{aula.nombre}</td>
                  <td>
                    <button style={{ background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>
                      Ver Tareas
                    </button>
                  </td>
                </tr>
              ))}
              {aulas.filter(a => a.role === 'estudiante').length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Aún no te has unido a ninguna clase. Usa un código arriba para empezar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'docente' && (
        <>
          {/* Panel: Creación Docente */}
          <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
            <strong style={{ color: '#2e7d32', fontSize: '1.1em' }}>Crear Nueva Clase</strong><br/><br/>
            <label>Nombre del Aula: </label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              style={{ marginRight: '10px', padding: '5px' }}
              placeholder="Ej. Matemáticas I"
            />
            <button 
              onClick={handleAgregar} 
              style={{ background: '#4CAF50', color: 'white', padding: '6px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}
            >
              Crear Aula
            </button>
          </div>

          <h3 style={{ marginTop: '30px' }}>Clases que Imparto</h3>
          <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
            <thead>
              <tr style={{ background: '#e0e0e0', color: 'black' }}>
                <th>#</th>
                <th>Nombre del Aula</th>
                <th>Código para Invitar</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {aulas.filter(a => a.role === 'docente').map((aula, index) => (
                <tr key={index} style={{ color: 'black' }}>
                  <td>{index + 1}</td>
                  <td>{aula.nombre}</td>
                  <td style={{ fontWeight: 'bold', color: '#d32f2f', letterSpacing: '2px' }}>{aula.codigo_invitacion}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedAula(aula);
                        setCurrentView('createTask');
                      }}
                      style={{ background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer', marginRight: '8px', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      Crear Tarea
                    </button>
                    <button style={{ background: '#f44336', color: 'white', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {aulas.filter(a => a.role === 'docente').length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No has creado ninguna clase todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;