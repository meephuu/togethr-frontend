export default function Footer() {
    return (
        <footer className='bg-gray-900 text-white px-8 py-12'>
            <div className='max-w-5xl mx-auto'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-1 mb-8'>
                    <div>
                        <h3 className='text-lg font-bold mb-4'>Togethr</h3>
                        <p className='text-gray-400'>Connect with travelers and guides worldwide</p>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Product</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button className='hover:text-white'>Features</button></li>
                            <li><button className='hover:text-white'>Pricing</button></li>
                            <li><button className='hover:text-white'>Blog</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Company</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button className='hover:text-white'>About Us</button></li>
                            <li><button className='hover:text-white'>Contact</button></li>
                            <li><button className='hover:text-white'>Careers</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-bold mb-4'>Legal</h4>
                        <ul className='text-gray-400 space-y-2'>
                            <li><button className='hover:text-white'>Privacy</button></li>
                            <li><button className='hover:text-white'>Terms</button></li>
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