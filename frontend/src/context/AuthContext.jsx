import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authService.getMe()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data,
              token
            }
          })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.login(credentials)
      
      const { token, data: user } = response
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success(`Welcome back, ${user.name}!`)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authService.register(userData)
      
      const { token, data: user } = response
      localStorage.setItem('token', token)
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success(`Welcome to PropertyRent, ${user.name}!`)
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  // Update user profile
  const updateUser = async (userData) => {
    try {
      const response = await authService.updateProfile(userData)
      dispatch({ type: 'UPDATE_USER', payload: response.data })
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      await authService.updatePassword(passwordData)
      toast.success('Password updated successfully')
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Password update failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
