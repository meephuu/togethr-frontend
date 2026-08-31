import { useState } from 'react'
import PersonalInfoPage from './PersonalInfopage'
import PasswordPage from './PasswordPage'
import AdditionalInfoPage from './AdditionalInfoPage'

export default function ProviderRegistrationPage() {
    const [page, setPage] = useState('personal')
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        languages: '',
        emergencyContact: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        // Send to backend (to be implemented)
        e.preventDefault();
        console.log('Submitting:', formData)
    }

    if (page === 'password') {
        return <PasswordPage formData={formData} handleChange={handleChange} onBack={() => setPage('additional')} onNext={handleSubmit} />
    }

    if (page === 'additional') {
        return <AdditionalInfoPage formData={formData} handleChange={handleChange} onBack={() => setPage('personal')} onNext={() => setPage('password')} />
    }

    return <PersonalInfoPage formData={formData} handleChange={handleChange} onNext={() => setPage('additional')} />
}