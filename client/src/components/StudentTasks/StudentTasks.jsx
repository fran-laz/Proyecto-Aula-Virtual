import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import TaskDelivery from './TaskDelivery';

const StudentTasks = ({ aula, onBack }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (aula) {
      fetchTareas();
    }
  }, [aula]);

  const fetchTareas = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('aula_id', aula.id);

      if (error) {
        console.error('Error obteniendo tareas:', error);
      } else {
        setTareas(data || []);
      }
    } catch (err) {
      console.error('Error inesperado obteniendo tareas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario seleccionó una tarea para entregar
  if (selectedTask) {
    return (
      <TaskDelivery 
        tarea={selectedTask}
        aula={aula}
        onBack={() => setSelectedTask(null)}
      />
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '15px' }}
        >
          &larr; Volver
        </button>
        <h2 style={{ margin: 0, color: '#333' }}>Tareas de: {aula?.nombre}</h2>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <p style={{ color: '#666' }}>Cargando tareas...</p>
        ) : tareas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <p>No hay tareas asignadas para esta clase por el momento.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {tareas.map((tarea) => (
              <div 
                key={tarea.identificación} 
                style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '6px', 
                  padding: '15px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  background: '#fafafa' 
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>{tarea.título}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px' }}>
                    Fecha límite: {tarea.fecha_límite ? new Date(tarea.fecha_límite).toLocaleString() : 'Sin fecha límite'} <br/>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedTask(tarea)}
                  style={{ 
                    background: '#1976d2', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Ver / Entregar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTasks;
