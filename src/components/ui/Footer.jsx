import { useNavigate } from 'react-router-dom'

export default function Footer() {
    const navigate = useNavigate()

    return (
        <footer className='bg-gray-900 text-white px-8 py-12'>
            <div className='max-w-5xl mx-auto'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-1 mb-8'>
                    <div>
                        <h3 className='text-lg font-bold mb-4'>Togethr</h3>
                        <p className='text-gray-400'>Connect with travelers and guides worldwide</p>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Explore</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button onClick={() => navigate('/provider-registration')} className='hover:text-white'>Become a guide</button></li>
                            <li><button onClick={() => navigate('/search')} className='hover:text-white'>Find experiences</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Account</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button onClick={() => navigate('/login')} className='hover:text-white'>Sign in</button></li>
                            <li><button onClick={() => navigate('/sign-up')} className='hover:text-white'>Create an account</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Legal</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button onClick={() => navigate('/privacy-policy')} className='hover:text-white'>Privacy</button></li>
                        </ul>
                    </div>
                </div>
                <div className='border-t border-gray-800 pt-8 text-center text-gray-400'>
                    <p>&copy; 2026 Togethr. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}