import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/firebase/auth-context'
import type { School } from '@/lib/types'

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, token } = useAuth()

  useEffect(() => {
    const fetchSchools = async () => {
      // Super admin doesn't need districtId, but district admin does
      if (!token || (!user?.districtId && user?.role !== 'super-admin')) return

      try {
        setLoading(true)
        console.log('🏫 Fetching schools - User role:', user?.role, 'District ID:', user?.districtId)
        
        // Use different endpoints based on user role
        const endpoint = user.role === 'super-admin' 
          ? '/api/super-admin/get-all-schools'
          : `/api/district-admin/schools?districtId=${user.districtId}`
        
        console.log('📡 Using endpoint:', endpoint)
        
        const response = await api.get<{ schools: School[] }>(endpoint, token)
        console.log('✅ Schools response:', response)
        
        setSchools(response.schools || [])
        setError(null)
      } catch (err) {
        console.error('❌ Error fetching schools:', err)
        setError('Failed to fetch schools')
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [token, user?.districtId, user?.role])

  const updateSchool = async (schoolId: string, data: Partial<School>) => {
    if (!token || (!user?.districtId && user?.role !== 'super-admin')) return

    try {
      const endpoint = user.role === 'super-admin'
        ? `/api/super-admin/update-school/${schoolId}`
        : `/api/district-admin/schools/${schoolId}`

      await api.put(endpoint, data, token)
      
      // Refetch schools to get updated data
      const fetchEndpoint = user.role === 'super-admin'
        ? '/api/super-admin/get-all-schools'
        : `/api/district-admin/schools?districtId=${user.districtId}`
      
      const response = await api.get<{ schools: School[] }>(fetchEndpoint, token)
      setSchools(response.schools || [])
      return true
    } catch (err) {
      console.error('Error updating school:', err)
      throw err
    }
  }

  const toggleSchoolStatus = async (schoolId: string) => {
    if (!token || (!user?.districtId && user?.role !== 'super-admin')) return

    try {
      const endpoint = user.role === 'super-admin'
        ? `/api/super-admin/toggle-school-status/${schoolId}`
        : `/api/district-admin/schools/${schoolId}/toggle-status`

      await api.put(endpoint, {}, token)
      
      // Refetch schools to get updated data
      const fetchEndpoint = user.role === 'super-admin'
        ? '/api/super-admin/get-all-schools'
        : `/api/district-admin/schools?districtId=${user.districtId}`
      
      const response = await api.get<{ schools: School[] }>(fetchEndpoint, token)
      setSchools(response.schools || [])
      return true
    } catch (err) {
      console.error('Error toggling school status:', err)
      throw err
    }
  }

  const createSchool = async (schoolData: {
    name: string
    address: string
    districtId: string
    adminName?: string
    adminEmail?: string
    contactPhone?: string
  }) => {
    if (!token || user?.role !== 'super-admin') {
      throw new Error('Only super admins can create schools')
    }

    try {
      console.log('🏫 Creating new school - Original data:', schoolData)
      
      // Filter out empty admin fields if not provided, but keep districtId even if empty string
      const cleanedData: any = {
        name: schoolData.name,
        address: schoolData.address,
      }
      
      // Only include districtId if it has a value
      if (schoolData.districtId && schoolData.districtId.trim()) {
        cleanedData.districtId = schoolData.districtId.trim()
      }
      
      // Only include optional fields if they have values
      if (schoolData.adminName && schoolData.adminName.trim()) {
        cleanedData.adminName = schoolData.adminName.trim()
      }
      if (schoolData.adminEmail && schoolData.adminEmail.trim()) {
        cleanedData.adminEmail = schoolData.adminEmail.trim()
      }
      if (schoolData.contactPhone && schoolData.contactPhone.trim()) {
        cleanedData.contactPhone = schoolData.contactPhone.trim()
      }
      
      console.log('🏫 Creating new school - Cleaned data:', cleanedData)
      
      const response = await api.post<{ school: School }>('/api/super-admin/create-school', cleanedData, token)
      console.log('✅ School created:', response)
      
      // Refetch schools to get updated data
      const fetchEndpoint = '/api/super-admin/get-all-schools'
      const updatedResponse = await api.get<{ schools: School[] }>(fetchEndpoint, token)
      setSchools(updatedResponse.schools || [])
      
      return response.school
    } catch (err) {
      console.error('❌ Error creating school:', err)
      throw err
    }
  }

  return {
    schools,
    loading,
    error,
    updateSchool,
    toggleSchoolStatus,
    createSchool
  }
} 