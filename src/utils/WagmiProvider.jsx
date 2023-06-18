import { ToastContainer } from 'react-toastify';
import { createClient, configureChains, defaultChains, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import 'react-toastify/dist/ReactToastify.css';

const WagmiProvider = ({ children }) => {

    const { provider, webSocketProvider } = configureChains(defaultChains, [publicProvider()]);

    const client = createClient({
        provider,
        webSocketProvider,
        autoConnect: true,
    });
    
    return (
        <WagmiConfig client={client}>
            <ToastContainer theme='dark' position="bottom-center"></ToastContainer>
            {children}
        </WagmiConfig >
    );
};

export default WagmiProvider;
