import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonalInfoPage from './PersonalInfopage'
import PasswordPage from './PasswordPage'
import AdditionalInfoPage from './AdditionalInfoPage'
import PrivacyPolicyModal from '../../../components/ui/PrivacyPolicyModal'
import { useAuth } from '../../../hooks/useAuth'
import { ApiError, AuthService } from '../../../services/generated'

export default function ProviderRegistrationPage() {
    const navigate = useNavigate()
    const { setUser } = useAuth()
    const [page, setPage] = useState('personal')
    const [showPolicyModal, setShowPolicyModal] = useState(true) // gate shown on mount
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [apiError, setApiError] = useState('')
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        nationalId: '',
        languages: '',
        emergencyContact: '',
        consent: false,
    })

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handlePolicyAccept = () => {
        setFormData(prev => ({ ...prev, consent: true }))
        setShowPolicyModal(false)
    }

    const handlePolicyClose = () => {
        // Declined to read/accept — send them back rather than
        // dropping them into a flow they can't complete
        navigate('/login')
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('')
        setIsSubmitting(true)
        try {
            const response = await AuthService.registerProvider({
                requestBody: {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    firstname: formData.firstName,
                    lastname: formData.lastName,
                    idCard: formData.nationalId,
                    languages: formData.languages,
                    emergencyContactPhone: formData.emergencyContact,
                    consent: formData.consent,
                },
            })
            const loginResponse = await AuthService.login({
                requestBody: { email: formData.email, password: formData.password },
            })
            setUser(loginResponse.user ?? response.user)
            navigate('/', { replace: true })
        } catch (error) {
            if (error instanceof ApiError) {
                setApiError(error.body?.error || 'Could not create your account. Please try again.')
            } else {
                setApiError('Could not connect to the server. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <PrivacyPolicyModal
                open={showPolicyModal}
                onAccept={handlePolicyAccept}
                onClose={handlePolicyClose}
            />
            {page === 'password' && (
                <PasswordPage
                    formData={formData}
                    handleChange={handleChange}
                    onBack={() => setPage('additional')}
                    onNext={handleSubmit}
                    isSubmitting={isSubmitting}
                    apiError={apiError}
                />
            )}
            {page === 'additional' && (
                <AdditionalInfoPage
                    formData={formData}
                    handleChange={handleChange}
                    onBack={() => setPage('personal')}
                    onNext={() => setPage('password')}
                />
            )}
            {page === 'personal' && (
                <PersonalInfoPage
                    formData={formData}
                    handleChange={handleChange}
                    onNext={() => setPage('additional')}
                />
            )}
        </>
    )
}