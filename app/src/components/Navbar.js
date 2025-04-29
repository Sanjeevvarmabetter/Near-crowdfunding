import { useEffect, useState, useContext } from 'react';
import { NearContext } from '@/wallets/near';

export const Navbar = ({ onRouteChange }) => {
    const { signedAccountId, wallet } = useContext(NearContext);
    const [action, setAction] = useState(() => { });
    const [label, setLabel] = useState('Loading...');

    useEffect(() => {
        if (!wallet) return;

        if (signedAccountId) {
            setAction(() => wallet.signOut);
            setLabel(`${signedAccountId}`);
        } else {
            setAction(() => wallet.signIn);
            setLabel('Connect Wallet');
        }
    }, [signedAccountId, wallet]);

    return (
        <nav className="bg-[#111827] shadow-md backdrop-blur-md bg-opacity-60 fixed top-0 left-0 w-full z-50 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                
                {/* Logo/Title */}
                <div
                    className="text-white text-2xl font-bold tracking-wide cursor-pointer"
                    onClick={() => onRouteChange('home')}
                >
                    NEAR CROWDFUNDING
                </div>

                {/* Nav Links */}
                <ul className="hidden md:flex space-x-8 text-sm font-medium">
                    {["Explore", "Create"].map((item, index) => (
                        <li
                            key={index}
                            className="text-gray-300 hover:text-white transition duration-150 ease-in-out cursor-pointer"
                            onClick={() => onRouteChange(item.toLowerCase())}
                        >
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Wallet Button */}
                <button
                    onClick={action}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow hover:bg-purple-700 transition duration-200"
                >
                    {label}
                </button>
            </div>
        </nav>
    );
};
