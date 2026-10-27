import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import Footer from '../../components/ui/Footer'
import { assetUrl } from '../../lib/assets'

export default function HomePage() {
    const navigate = useNavigate()

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />

            {/* Hero Section */}
            <section className='px-4 py-20'>
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
                        <button
                            onClick={() => navigate('/search')}
                            className='border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition'
                        >
                            Explore experiences
                        </button>
                    </div>
                </div>
            </section>

            <section className='px-6 py-20 sm:px-8 sm:py-28 bg-blue-50'>
                <div className='mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16'>
                    <div>
                            <p className='mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700'>
                                See a place differently
                            </p>
                            <h2 className='max-w-2xl text-3xl font-semibold leading-tight text-[#252a40] sm:text-4xl'>
                                Go beyond the guidebook.
                            </h2>
                            <p className='mt-5 max-w-lg text-base leading-7 text-gray-600 sm:text-lg'>
                                Take the scenic route, find a neighborhood favorite, or share a meal. Local experiences make a trip your own.
                            </p>
                            <button
                                onClick={() => navigate('/search')}
                                className='mt-7 inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:gap-3'
                            >
                                Browse experiences <span aria-hidden='true'>→</span>
                            </button>
                    </div>

                    <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                        <figure className='col-span-2 overflow-hidden rounded-2xl'>
                            <img
                                src={assetUrl('/uploads/services-cover-photo/service006.jpg')}
                                alt='A lively outdoor market in Bangkok'
                                className='h-52 w-full object-cover sm:h-72'
                            />
                        </figure>
                        <figure className='overflow-hidden rounded-2xl'>
                            <img
                                src={assetUrl('/uploads/services-cover-photo/service005.jpg')}
                                alt='A traveler exploring a Bangkok temple'
                                className='h-36 w-full object-cover sm:h-48'
                            />
                        </figure>
                        <figure className='overflow-hidden rounded-2xl'>
                            <img
                                src={assetUrl('/uploads/services-cover-photo/service007.jpg')}
                                alt='Travelers visiting a waterfall in the forest'
                                className='h-36 w-full object-cover sm:h-48'
                            />
                        </figure>
                    </div>
                </div>
            </section>

            <section className=' px-6 py-20 sm:px-8 sm:py-28'>
                <div className='mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20'>
                    <div>
                        <p className='mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700'>
                            A good place to start
                        </p>
                        <h2 className='text-3xl font-semibold leading-tight text-[#252a40] sm:text-4xl'>
                            Your next story starts with a hello.
                        </h2>
                    </div>
                    <div className='divide-y divide-gray-200 border-y border-gray-200'>
                        <div className='grid gap-2 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6'>
                            <span className='font-heading text-sm text-blue-700'>01</span>
                            <div>
                                <h3 className='text-lg font-semibold text-[#252a40]'>Explore what’s out there</h3>
                                <p className='mt-2 leading-6 text-gray-600'>Search local experiences and find one that catches your eye.</p>
                            </div>
                        </div>
                        <div className='grid gap-2 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6'>
                            <span className='font-heading text-sm text-blue-700'>02</span>
                            <div>
                                <h3 className='text-lg font-semibold text-[#252a40]'>Meet your guide</h3>
                                <p className='mt-2 leading-6 text-gray-600'>Connect with the person who will help you see the place differently.</p>
                            </div>
                        </div>
                        <div className='grid gap-2 py-6 sm:grid-cols-[5rem_1fr] sm:gap-6'>
                            <span className='font-heading text-sm text-blue-700'>03</span>
                            <div>
                                <h3 className='text-lg font-semibold text-[#252a40]'>Go make a memory</h3>
                                <p className='mt-2 leading-6 text-gray-600'>Show up curious. The best moments rarely need a strict itinerary.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className='px-6 py-16 sm:px-8 sm:py-20 bg-blue-100'>
                <div className='relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#252a40] px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14'>
                    <div className='grid gap-10 md:grid-cols-[1fr_auto] md:items-center'>
                        <div className='max-w-2xl'>
                            <p className='mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300'>
                                Your journey, your way
                            </p>
                            <h2 className='text-3xl font-semibold leading-tight sm:text-4xl'>
                                Come explore—or show someone around.
                            </h2>
                            <p className='mt-4 max-w-xl leading-7 text-gray-300'>
                                Find a local perspective for your next trip, or share the place you call home.
                            </p>
                        </div>
                        <div className='flex flex-col gap-3 sm:flex-row md:flex-col'>
                            <button
                                onClick={() => navigate('/search')}
                                className='inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl bg-white px-6 py-3.5 font-semibold text-[#252a40] transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                            >
                                Find experiences <span aria-hidden='true'>→</span>
                            </button>
                            <button
                                onClick={() => navigate('/provider-registration')}
                                className='inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                            >
                                Become a guide <span aria-hidden='true'>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}   