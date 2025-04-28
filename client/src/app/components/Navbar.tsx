import { useEffect, useState, useContext } from 'react';
import { NearContext } from '@/wallets/near';

interface NavbarProps {
  onRouteChange: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRouteChange }) => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [action, setAction] = useState<() => void>(() => () => {});
  const [label, setLabel] = useState<string>('Loading...');

  useEffect(() => {
    if (!wallet) return;

    if (signedAccountId) {
      setAction(() => wallet.signOut);
      setLabel(signedAccountId);
    } else {
      setAction(() => wallet.signIn);
      setLabel('Connect');
    }
  }, [signedAccountId, wallet]);

  return (
    <nav className="fixed top-0 w-full z-10">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <p
          className="text-white text-xl font-semibold cursor-pointer uppercase no-underline"
          onClick={() => onRouteChange('home')}
        >
          Ignitus Networks
        </p>
        <button onClick={action} className="text-white bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600">
          {label}
        </button>
      </div>
    </nav>
  );
};
