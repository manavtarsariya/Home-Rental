import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFunction(...args)
      setData(response.data)
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refetch = (...args) => {
    return fetchData(...args)
  }

  useEffect(() => {
    if (apiFunction) {
      fetchData()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch,
    setData
  }
}

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (asyncFunction, ...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction(...args)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null)
  }
}
