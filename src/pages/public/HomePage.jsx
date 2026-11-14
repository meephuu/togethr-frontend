import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar'
import Footer from '../../components/ui/Footer'
import { assetUrl } from '../../lib/assets'

// Fanned photo cards with floating pieces of the real product (booking, chat, review)
function HeroCollage() {
    const photo = (name) => assetUrl(`/uploads/services-cover-photo/${name}.jpg`)

    return (
        <div className='relative mx-auto mt-16 h-[26rem] w-full max-w-4xl sm:mt-20 sm:h-[31rem]' aria-hidden='true'>
            {/* soft glow behind the cards */}
            <div className='absolute left-1/2 top-1/2 h-72 w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100 blur-3xl sm:h-96' />

            {/* left card */}
            <figure className='absolute left-1/2 top-10 w-40 -translate-x-[110%] -rotate-6 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 sm:top-16 sm:w-56 sm:-translate-x-[138%]'>
                <img src={photo('service005')} alt='' className='h-52 w-full object-cover sm:h-72' />
            </figure>

            {/* right card */}
            <figure className='absolute left-1/2 top-10 w-40 translate-x-[10%] rotate-6 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 sm:top-16 sm:w-56 sm:translate-x-[38%]'>
                <img src={photo('service007')} alt='' className='h-52 w-full object-cover sm:h-72' />
            </figure>

            {/* centre card */}
            <figure className='absolute left-1/2 top-0 z-10 w-52 -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:w-72'>
                <img src={photo('service006')} alt='' className='h-60 w-full object-cover sm:h-80' />
                <figcaption className='flex items-center justify-between gap-3 px-4 py-3 text-left'>
                    <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold text-[#252a40]'>Night market walk</p>
                        <p className='text-xs text-gray-500'>Bangkok · 3 hours</p>
                    </div>
                    <span className='shrink-0 text-sm font-semibold text-blue-700'>฿450</span>
                </figcaption>
            </figure>

            {/* booking confirmed */}
            <div className='absolute left-1 top-24 z-20 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 text-left shadow-xl ring-1 ring-black/5 sm:left-6 sm:top-36'>
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700'>
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M20 6 9 17l-5-5' /></svg>
                </span>
                <div>
                    <p className='text-sm font-semibold text-[#252a40]'>Booking confirmed</p>
                    <p className='text-xs text-gray-500'>Sat, 10:00 – 13:00</p>
                </div>
            </div>

            {/* rating */}
            <div className='absolute right-1 top-4 z-20 hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-xl ring-1 ring-black/5 sm:right-6 sm:top-10 sm:flex'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='#f97316'><path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z' /></svg>
                <span className='text-sm font-semibold text-[#252a40]'>4.9</span>
                <span className='text-xs text-gray-500'>128 reviews</span>
            </div>

            {/* chat */}
            <div className='absolute bottom-0 right-0 z-20 flex max-w-[15rem] flex-col gap-2 text-left sm:bottom-8 sm:right-4'>
                <p className='self-start rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm text-[#252a40] shadow-xl ring-1 ring-black/5'>
                    Meet you at the pier at 10?
                </p>
                <p className='self-end rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white shadow-xl'>
                    Perfect, see you there!
                </p>
            </div>

            {/* verified guide */}
            <div className='absolute bottom-6 left-0 z-20 hidden items-center gap-2 rounded-full bg-[#252a40] px-4 py-2.5 text-sm font-medium text-white shadow-xl sm:left-10 sm:bottom-14 sm:flex'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#93c5fd' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5z' /><path d='m9 12 2 2 4-4' /></svg>
                Verified local guide
            </div>
        </div>
    )
}

export default function HomePage() {
    const navigate = useNavigate()

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />

            {/* Hero Section */}
            <section className='overflow-hidden px-4 pt-20 pb-24 sm:pt-24 sm:pb-32'>
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

                <HeroCollage />
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