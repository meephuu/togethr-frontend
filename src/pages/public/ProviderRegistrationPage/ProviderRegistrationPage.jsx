import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonalInfoPage from './PersonalInfopage'
import PasswordPage from './PasswordPage'
import AdditionalInfoPage from './AdditionalInfoPage'
import PrivacyPolicyModal from '../../../components/ui/PrivacyPolicyModal'
import { useAuth } from '../../../hooks/useAuth'
import { ApiError, AuthService, UsersService } from '../../../services/generated'
import { dashboardFor } from '../../../lib/roles'

export default function ProviderRegistrationPage() {
    const navigate = useNavigate()
    const { user, setUser, isAuthenticated } = useAuth()
    // Someone already signed in is adding a provider profile to the account they
    // have, so the name/email/password steps and the consent gate — which they
    // already completed when they registered — are skipped.
    const [page, setPage] = useState(isAuthenticated ? 'additional' : 'personal')
    const [showPolicyModal, setShowPolicyModal] = useState(!isAuthenticated)
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

    // Existing account: attach a provider profile rather than making a new user
    const handleAddProviderProfile = async () => {
        setApiError('')
        setIsSubmitting(true)
        try {
            const response = await UsersService.addProviderProfile({
                requestBody: {
                    idCard: formData.nationalId,
                    languages: formData.languages,
                    emergencyContactPhone: formData.emergencyContact,
                },
            })
            setUser(response.user)
            navigate('/provider/dashboard', { replace: true })
        } catch (error) {
            if (error instanceof ApiError) {
                setApiError(error.body?.error || 'Could not add a provider profile. Please try again.')
            } else {
                setApiError('Could not connect to the server. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
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
            navigate('/provider/dashboard', { replace: true })
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
                    onBack={
                        isAuthenticated
                            ? () => navigate(dashboardFor(user))
                            : () => setPage('personal')
                    }
                    onNext={
                        isAuthenticated
                            ? handleAddProviderProfile
                            : () => setPage('password')
                    }
                    isSubmitting={isSubmitting}
                    apiError={apiError}
                    submitLabel={isAuthenticated ? 'Become a Provider' : 'Next ➝'}
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