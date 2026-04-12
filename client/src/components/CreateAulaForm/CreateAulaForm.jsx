import React, { useState } from 'react';
import './CreateAulaForm.css';

const CreateAulaForm = () => {
    const [nombre, setNombre] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            const code = generateCode();
            setGeneratedCode(code);
            setIsSuccess(true);
            setIsSubmitting(false);
        }, 1500);
    };

    const resetForm = () => {
        setNombre('');
        setGeneratedCode('');
        setIsSuccess(false);
    };

    if (isSuccess) {
        return (
            <div className="form-container">
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                        ¡Aula Creada!
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 300 }}>
                        Tu nueva aula "{nombre}" está lista para usarse.
                    </p>

                    <div className="success-code">
                        {generatedCode}
                    </div>
                    <p style={{ marginBottom: "2.5rem", color: "#64748b", fontSize: "0.95rem" }}>
                        Comparte este código de invitación con tus estudiantes para que puedan unirse a la clase.
                    </p>

                    <button className="submit-btn reset-btn" onClick={resetForm}>
                        Crear otra aula
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="form-container">
            <div className="form-header">
                <h2>Crear Nueva Aula</h2>
                <p>Configura un nuevo espacio virtual de aprendizaje</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="nombre">Nombre del Aula</label>
                    <input
                        type="text"
                        id="nombre"
                        className="form-input"
                        placeholder="Ej. Introducción a la Programación SIS2"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        autoComplete="off"
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting || nombre.trim() === ''}
                >
                    {isSubmitting ? 'Creando Aula...' : 'Crear Aula'}
                </button>
            </form>
        </div>
    );
};

export default CreateAulaForm;
