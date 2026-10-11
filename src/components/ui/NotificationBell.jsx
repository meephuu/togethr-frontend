

import { useState } from 'react'

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'New booking request', time: '5 min ago', read: false },
        { id: 2, message: 'Service published', time: '1 hour ago', read: false },
        { id: 3, message: 'Review from customer', time: '2 hours ago', read: true }
    ])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ))
    }

    return (
        <div className='relative'>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='relative p-2 text-gray-600 hover:text-gray-900 transition'
            >
                {/* Bell Icon */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="lucide lucide-bell preview-icon"
                >
                    <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className='absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className='absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                    <div className='p-4 border-b border-gray-200'>
                        <h3 className='text-lg font-bold text-gray-900'>Notifications</h3>
                    </div>

                    <div className='max-h-96 overflow-y-auto'>
                        {notifications.length === 0 ? (
                            <div className='p-4 text-center text-gray-500'>
                                No notifications
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif.id)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                                        notif.read ? 'bg-white' : 'bg-blue-50'
                                    }`}
                                >
                                    <p className='text-sm font-medium text-gray-900'>
                                        {notif.message}
                                    </p>
                                    <p className='text-xs text-gray-500 mt-1'>
                                        {notif.time}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className='p-3 border-t border-gray-200 text-center'>
                        <button className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                            View all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}