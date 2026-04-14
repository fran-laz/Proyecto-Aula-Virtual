import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const TaskDelivery = ({ tarea, aula, onBack }) => {
  const [file, setFile] = useState(null);
  const [base64Image, setBase64Image] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Convertir a base 64 para guardarlo en la BBDD
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!base64Image) {
      alert('Por favor selecciona una imagen para subir.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData?.session?.user?.id;

      if (!userId) {
        alert('No se pudo encontrar la sesión del usuario.');
        setIsSubmitting(false);
        return;
      }

      // Payload para la tabla entregas
      const entrega = {
        tarea_id: tarea.id,
        estudiante_id: userId,
        archivo: base64Image
      };

      if (supabase) {
        const { error } = await supabase
          .from('entregas')
          .insert([entrega]);

        if (error) {
          console.error('Error insertando la entrega en Supabase:', error);
          if (error.code === '42P01') {
            alert('¡Modo de prueba local! Asegúrate de crear la tabla "entregas" en Supabase. Entrega simulada exitosamente.');
            setSuccess(true);
          } else {
            alert('Error al enviar la tarea: ' + error.message);
          }
        } else {
          setSuccess(true);
        }
      } else {
        alert('Entrega simulada. Cliente de supabase no disponible.');
        setSuccess(true);
      }
    } catch (err) {
      console.error('Excepción al entregar tarea:', err);
      alert('Hubo un error inesperado al procesar la entrega.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#e8f5e9', padding: '40px', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
          <h2 style={{ color: '#2e7d32' }}>¡Tarea Entregada!</h2>
          <p style={{ color: '#555', fontSize: '18px' }}>Tu tarea "{tarea.titulo}" se ha enviado correctamente.</p>
          <button 
            onClick={onBack}
            style={{ 
              marginTop: '20px',
              background: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Volver a Tareas
          </button>
        </div>
      </div>
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
        <h2 style={{ margin: 0, color: '#333' }}>Entregar Tarea</h2>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, color: '#1976d2', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
          {tarea.titulo}
        </h3>
        
        <div style={{ marginBottom: '25px', background: '#f9f9f9', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #1976d2' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Instrucciones:</p>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#444' }}>{tarea.descripcion || "Sin instrucciones detalladas"}</p>
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <span><strong>Puntuación:</strong> {tarea.puntuacion} puntos</span>
            <span><strong>Límite:</strong> {tarea.fecha_entrega ? new Date(tarea.fecha_entrega).toLocaleString() : 'Sin límite'}</span>
          </div>
        </div>

        <div style={{ border: '2px dashed #ccc', padding: '30px', borderRadius: '8px', textAlign: 'center', background: file ? '#e3f2fd' : '#fafafa' }}>
          <p style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#555' }}>
            Adjuntar Resolución (Imagen)
          </p>
          
          <input 
            type="file" 
            id="file-upload"
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }}
          />
          <label 
            htmlFor="file-upload" 
            style={{
              background: '#fff',
              border: '1px solid #1976d2',
              color: '#1976d2',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'inline-block',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            {file ? "Cambiar Archivo" : "Seleccionar Archivo"}
          </label>

          {file && (
            <div style={{ marginTop: '15px', color: '#2e7d32', fontWeight: 'bold' }}>
              <p>Archivo seleccionado: {file.name}</p>
              {base64Image && (
                <img 
                  src={base64Image} 
                  alt="Vista previa de entrega" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', marginTop: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                />
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <button 
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            style={{ 
              background: (!file || isSubmitting) ? '#bdbdbd' : '#4CAF50', 
              color: 'white', 
              border: 'none', 
              padding: '12px 25px', 
              borderRadius: '4px', 
              cursor: (!file || isSubmitting) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {isSubmitting ? 'Enviando...' : 'Confirmar Entrega'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDelivery;
