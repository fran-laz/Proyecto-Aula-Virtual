import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const CreateTask = ({ aula, onCancel, onTaskCreated }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [puntuacion, setPuntuacion] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setIsSubmitting(true);
    
    // Preparar el objeto de la tarea
    const nuevaTarea = {
      "título": titulo,
      "descripción": descripcion,
      "fecha_límite": fechaEntrega || null,
      aula_id: aula?.id || null
    };

    try {
      if (supabase) {
        // Asume que existe una tabla 'tareas' en Supabase
        const { data, error } = await supabase
          .from('tareas')
          .insert([nuevaTarea])
          .select();

        if (error) {
          console.error("Error al guardar en Supabase:", error);
          // Fallback por si la tabla 'tareas' no existe aún
          alert("Tarea creada localmente. Nota: Crea la tabla 'tareas' en Supabase para persistencia real.");
          if (onTaskCreated) onTaskCreated(nuevaTarea);
        } else {
          if (onTaskCreated) onTaskCreated(data?.[0] || nuevaTarea);
        }
      } else {
        if (onTaskCreated) onTaskCreated(nuevaTarea);
      }
    } catch (err) {
      console.error("Excepción inesperada:", err);
    } finally {
      setIsSubmitting(false);
      setTitulo('');
      setDescripcion('');
      setFechaEntrega('');
      setPuntuacion('100');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Gestor de Aulas Virtuales - Crear Tarea</h2>
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', background: '#f5f5f5' }}>
        <strong>Crear Nueva Tarea {aula?.nombre ? `para ${aula.nombre}` : ''}</strong>
        <p style={{ fontSize: '14px', color: '#555' }}>Asigna una nueva actividad a los estudiantes de la clase.</p>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título de la Tarea: </label>
          <input 
            type="text" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            style={{ padding: '4px', width: '100%', maxWidth: '300px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Instrucciones: </label>
          <textarea 
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)} 
            rows={4}
            style={{ padding: '4px', width: '100%', maxWidth: '400px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Fecha de Entrega: </label>
            <input 
              type="datetime-local" 
              value={fechaEntrega} 
              onChange={(e) => setFechaEntrega(e.target.value)} 
              style={{ padding: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Puntuación Máxima: </label>
            <input 
              type="number" 
              value={puntuacion} 
              onChange={(e) => setPuntuacion(e.target.value)} 
              min="0"
              max="100"
              style={{ padding: '4px', width: '60px' }}
            />
          </div>
        </div>

        <div>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ background: '#9e9e9e', color: 'white', padding: '5px 15px', cursor: 'pointer', border: '1px solid #757575', marginRight: '10px' }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !titulo.trim()}
            style={{ background: '#4CAF50', color: 'white', padding: '5px 15px', cursor: (isSubmitting || !titulo.trim()) ? 'not-allowed' : 'pointer', border: '1px solid #388E3C', opacity: (isSubmitting || !titulo.trim()) ? 0.6 : 1 }}
          >
            {isSubmitting ? 'Asignando...' : 'Asignar Tarea'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
