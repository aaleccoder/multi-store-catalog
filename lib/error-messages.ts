export const ERROR_MESSAGES: Record<string, string> = {
    SLUG_ALREADY_EXISTS: 'El slug ya está en uso. Por favor, elige un slug diferente.',
    EMAIL_ALREADY_EXISTS: 'Este correo electrónico ya está registrado.',
    FOREIGN_KEY_CONSTRAINT: 'No se puede eliminar porque tiene elementos asociados.',
    ITEM_NOT_FOUND: 'El elemento que buscas no existe.',
    RESOURCE_IN_USE: 'No se puede eliminar este recurso porque está en uso.',

    INVALID_INPUT: 'Los datos proporcionados no son válidos.',
    MISSING_REQUIRED_FIELD: 'Falta un campo requerido.',
    INVALID_FILE_TYPE: 'El tipo de archivo no es compatible.',
    FILE_TOO_LARGE: 'El archivo es demasiado grande.',

    PERMISSION_DENIED: 'No tienes permiso para realizar esta acción.',
    CANNOT_MODIFY_SELF: 'No puedes modificar tu propia cuenta.',
    AUTH_REQUIRED: 'Debes iniciar sesión para continuar.',
    AUTH_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',

    INVALID_STATE: 'Esta operación no está permitida en el estado actual.',
    OPERATION_FAILED: 'La operación no pudo completarse.',

    NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a Internet.',
    SERVER_ERROR: 'Error del servidor. Por favor, intenta nuevamente más tarde.',
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
}

export function getErrorMessage(error: any): string {
    if (!error) {
        return ERROR_MESSAGES.UNKNOWN_ERROR
    }

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('Error structure:', {
            error,
            cause: error.cause,
            data: error.data,
            shape: error.shape,
            message: error.message,
        })
    }

    const errorCode =
        error.cause?.code ||
        error.data?.cause?.code ||
        error.data?.code ||
        error.shape?.data?.cause?.code ||
        error.shape?.data?.code ||
        error.shape?.cause?.code

    if (errorCode && ERROR_MESSAGES[errorCode]) {
        return ERROR_MESSAGES[errorCode]
    }

    if (error.message && ERROR_MESSAGES[error.message]) {
        return ERROR_MESSAGES[error.message]
    }

    if (
        error.message?.toLowerCase().includes('fetch') ||
        error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('failed to fetch') ||
        error.name === 'NetworkError' ||
        error.name === 'TypeError' && error.message?.includes('fetch')
    ) {
        return ERROR_MESSAGES.NETWORK_ERROR
    }

    if (typeof error === 'string' && ERROR_MESSAGES[error]) {
        return ERROR_MESSAGES[error]
    }

    const errorMessage = error.message || error.data?.message || error.toString()
    if (
        typeof errorMessage === 'string' &&
        errorMessage.length > 5 &&
        errorMessage.length < 200 &&
        /^[A-ZÀ-ÿ]/.test(errorMessage) &&
        !ERROR_MESSAGES[errorMessage]
    ) {
        return errorMessage
    }

    return ERROR_MESSAGES.UNKNOWN_ERROR
}
