import { AuthProvider } from '@/context/AuthContext';

type Props = {
    children: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
    return <AuthProvider>{children}</AuthProvider>;
};
