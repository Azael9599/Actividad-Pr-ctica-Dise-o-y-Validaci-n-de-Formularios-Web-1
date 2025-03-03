document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const form = document.getElementById('registroForm');
    const pasos = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const btnNext = document.querySelectorAll('.btn-next');
    const btnPrev = document.querySelectorAll('.btn-prev');
    const btnSubmit = document.querySelector('.btn-submit');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const successModal = document.getElementById('successModal');
    
    // Configuración de campos que requieren validación
    const validationFields = {
        'nombre': {
            validate: (value) => {
                return value.trim().length >= 3 && /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(value);
            },
            errorMessage: 'Ingresa un nombre válido (mínimo 3 caracteres, solo letras)'
        },
        'fechaNacimiento': {
            validate: (value) => {
                if (!value) return false;
                const hoy = new Date();
                const fechaNac = new Date(value);
                let edad = hoy.getFullYear() - fechaNac.getFullYear();
                const m = hoy.getMonth() - fechaNac.getMonth();
                if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
                    edad--;
                }
                return edad >= 13;
            },
            errorMessage: 'Debes tener al menos 13 años para registrarte'
        },
        'email': {
            validate: (value) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            errorMessage: 'Ingresa un correo electrónico válido'
        },
        'password': {
            validate: (value) => {
                const tieneMinimo8 = value.length >= 8;
                const tieneMayuscula = /[A-Z]/.test(value);
                const tieneMinuscula = /[a-z]/.test(value);
                const tieneNumero = /[0-9]/.test(value);
                
                // Actualizar indicadores visuales
                document.getElementById('req-length').classList.toggle('valid', tieneMinimo8);
                document.getElementById('req-uppercase').classList.toggle('valid', tieneMayuscula);
                document.getElementById('req-lowercase').classList.toggle('valid', tieneMinuscula);
                document.getElementById('req-number').classList.toggle('valid', tieneNumero);
                
                return tieneMinimo8 && tieneMayuscula && tieneMinuscula && tieneNumero;
            },
            errorMessage: 'La contraseña no cumple con los requisitos mínimos'
        },
        'confirmPassword': {
            validate: (value) => {
                return value === document.getElementById('password').value && value !== '';
            },
            errorMessage: 'Las contraseñas no coinciden'
        },
        'tipoUsuario': {
            validate: (value) => {
                return value !== '';
            },
            errorMessage: 'Selecciona un tipo de usuario'
        },
        'nivelEducativo': {
            validate: (value) => {
                const tipoUsuario = document.getElementById('tipoUsuario').value;
                if (tipoUsuario === 'estudiante') {
                    return value !== '';
                }
                return true; // No validar si no es estudiante
            },
            errorMessage: 'Selecciona un nivel educativo'
        },
        'especializacion': {
            validate: (value) => {
                const tipoUsuario = document.getElementById('tipoUsuario').value;
                if (tipoUsuario === 'profesor') {
                    const select = document.getElementById('especializacion');
                    return Array.from(select.selectedOptions).length > 0;
                }
                return true; // No validar si no es profesor
            },
            errorMessage: 'Selecciona al menos un área de especialización'
        },
        'pais': {
            validate: (value) => {
                return value !== '';
            },
            errorMessage: 'Selecciona un país'
        },
        'ciudad': {
            validate: (value) => {
                return value.trim() !== '';
            },
            errorMessage: 'Ingresa una ciudad'
        },
        'terminos': {
            validate: (value) => {
                return document.getElementById('terminos').checked;
            },
            errorMessage: 'Debes aceptar los términos y condiciones'
        }
    };
    
    // Índice del paso actual
    let currentStep = 0;
    
    // Función para mostrar el paso actual
    function showStep(stepIndex) {
        pasos.forEach((paso, index) => {
            paso.classList.toggle('active', index === stepIndex);
        });
        
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index <= stepIndex);
        });
        
        currentStep = stepIndex;
    }
    
    // Validar un campo específico
    function validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!field || !validationFields[fieldId]) return true;
        
        const isValid = validationFields[fieldId].validate(field.value);
        
        if (isValid) {
            field.classList.add('valid');
            field.classList.remove('error');
            errorElement.textContent = '';
        } else {
            field.classList.add('error');
            field.classList.remove('valid');
            errorElement.textContent = validationFields[fieldId].errorMessage;
        }
        
        return isValid;
    }
    
    // Validar todos los campos de un paso
    function validateStep(stepIndex) {
        const currentFieldset = pasos[stepIndex];
        const fields = currentFieldset.querySelectorAll('input, select');
        let isValid = true;
        
        fields.forEach(field => {
            // Solo validar campos con reglas definidas
            if (validationFields[field.id]) {
                const fieldIsValid = validateField(field.id);
                isValid = isValid && fieldIsValid;
            }
        });
        
        return isValid;
    }
    
    // Event listeners para los botones "Siguiente"
    btnNext.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (validateStep(index)) {
                showStep(index + 1);
            }
        });
    });
    
    // Event listeners para los botones "Anterior"
    btnPrev.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            showStep(index);
        });
    });
    
    // Mostrar/ocultar campos dependiendo del tipo de usuario
    document.getElementById('tipoUsuario').addEventListener('change', function() {
        const nivelEducativoContainer = document.getElementById('nivelEducativoContainer');
        const especializacionContainer = document.getElementById('especializacionContainer');
        
        nivelEducativoContainer.style.display = 'none';
        especializacionContainer.style.display = 'none';
        
        if (this.value === 'estudiante') {
            nivelEducativoContainer.style.display = 'block';
        } else if (this.value === 'profesor') {
            especializacionContainer.style.display = 'block';
        }
    });
    
    // Toggle para mostrar/ocultar contraseñas
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordField = this.previousElementSibling;
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Cambiar el ícono o texto del botón
            this.setAttribute('aria-label', type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
        });
    });
    
    // Validación en tiempo real para campos individuales
    Object.keys(validationFields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                validateField(fieldId);
            });
            
            field.addEventListener('blur', () => {
                validateField(fieldId);
            });
        }
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateStep(currentStep)) {
            // Aquí iría el código para enviar datos al servidor
            // Por ahora, simulamos un envío exitoso
            
            // Recopilar datos del formulario
            const formData = new FormData(form);
            const formDataObj = {};
            
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            console.log('Datos del formulario:', formDataObj);
            
            // Mostrar modal de éxito
            successModal.removeAttribute('hidden');
            
            // Limpiar formulario
            form.reset();
            showStep(0);
        }
    });
    
    // Cerrar modal y volver al inicio
    document.querySelector('#successModal .btn-primary').addEventListener('click', function() {
        successModal.setAttribute('hidden', '');
    });
});