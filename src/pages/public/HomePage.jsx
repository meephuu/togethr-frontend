import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import Footer from '../../components/ui/Footer'

export default function HomePage() {
    const navigate = useNavigate()

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />

            {/* Hero Section */}
            <section className='px-4 py-20 bg-gradient-to-r from-blue-50 to-blue-100'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h1 className='text-5xl font-bold text-gray-900 mb-6'>
                        Don’t let the fear of <br />traveling alone keep you <br />from the world.
                    </h1>
                    <p className='text-xl text-gray-600 mb-8'>
                        Connect with local guides and travelers. Share experiences, explore together.
                    </p>
                    <div className='flex gap-4 justify-center'>
                        <button
                            onClick={() => navigate('/sign-up')}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition'
                        >
                            Get Started
                        </button>
                        <button className='border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition'>
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='px-4 py-20'>
                <div className='max-w-5xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>Why Choose Us?</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        
                        {/* Feature 1 */}
                        <div className='p-6 border border-gray-200 rounded-lg hover:shadow-lg transition'>
                            <div className='text-4xl mb-4'>🌍</div>
                            <h3 className='text-xl font-bold text-gray-900 mb-2'>Explore Anywhere</h3>
                            <p className='text-gray-600'>Discover hidden gems and local experiences with authentic guides</p>
                        </div>

                        {/* Feature 2 */}
                        <div className='p-6 border border-gray-200 rounded-lg hover:shadow-lg transition'>
                            <div className='text-4xl mb-4'>👥</div>
                            <h3 className='text-xl font-bold text-gray-900 mb-2'>Meet Locals</h3>
                            <p className='text-gray-600'>Connect with travelers and guides who share your interests</p>
                        </div>

                        {/* Feature 3 */}
                        <div className='p-6 border border-gray-200 rounded-lg hover:shadow-lg transition'>
                            <div className='text-4xl mb-4'>💯</div>
                            <h3 className='text-xl font-bold text-gray-900 mb-2'>Verified Profiles</h3>
                            <p className='text-gray-600'>Trusted community with verified travelers and professional guides</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className='px-4 py-20 bg-gray-50'>
                <div className='max-w-5xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>How It Works</h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        
                        <div className='text-center'>
                            <div className='bg-blue-600 text-white text-2xl font-bold w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center'>1</div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>Sign Up</h3>
                            <p className='text-gray-600'>Create your profile as a traveler or guide</p>
                        </div>

                        <div className='text-center'>
                            <div className='bg-blue-600 text-white text-2xl font-bold w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center'>2</div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>Connect</h3>
                            <p className='text-gray-600'>Browse and match with compatible travelers or guides</p>
                        </div>

                        <div className='text-center'>
                            <div className='bg-blue-600 text-white text-2xl font-bold w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center'>3</div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>Explore</h3>
                            <p className='text-gray-600'>Start your adventure and create memories together</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='px-4 py-20 bg-blue-600'>
                <div className='max-w-2xl mx-auto text-center'>
                    <h2 className='text-3xl font-bold text-white mb-6'>Ready to Start Your Journey?</h2>
                    <p className='text-blue-100 mb-8 text-lg'>Join thousands of travelers and guides discovering the world together</p>
                    <button
                        onClick={() => navigate('/sign-up')}
                        className='bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition'
                    >
                        Sign Up Now
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    )
}