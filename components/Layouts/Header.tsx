'use client'

import { userAdmin } from "@/context/UserContext";


export function Header () {
    const {user} = userAdmin();
    return(
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <h2 className="text-lg font-semibold text-gray-800">Chapel of Divine Inspiration</h2>
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName.charAt(0).toUpperCase()}{user?.lastName.charAt(0).toUpperCase()}
            </div>
            </div>
        </header>
    )
}