import { useContext, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { StoreContext } from "../../utils/Store";
import { magicLogin } from "../../utils/user";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { ArrowForward, ContentCopyRounded, Replay } from "@mui/icons-material";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import { ContractABI, ContractAddress } from "../../utils/constants";

const RedirectPageContainer = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    span {
        margin-top: 1rem;
        color: white;
        font-size: 1.1rem;
    }
`;

const WalletInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2rem;
    color: white;
`;


const AccountAddress = styled.div`
    font-weight: bold;
    color: #dbdbdb;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
`;

const AccountBalance = styled.div`
    font-weight: bold;
    color: #dbdbdb;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: baseline;
`;

const BalanceAmount = styled.div`
    color: #F423BA;
    font-size: 1.8rem;
    padding-right: 0.4rem;
`;

const NextButton = styled.button`
    margin-left: 1rem;
    background-color: #2e72f6;
    color: white;
    border: none;
    outline: none;
    border-bottom: #1e5ed9 6px solid;
    padding: 0.8rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    /* margin-top: 2rem; */
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover {
        transform: translateY(-2px);
    }
    &:active {
        transition: all 0.1s ease;
        transform: translateY(4px);
    }
`;

const ReloadWallet = styled.div`
    cursor: pointer;
    margin-left: 0.5rem;
    transition: all 1s ease;
    &:hover{
        transform: rotateZ(-20deg);
    }
    &:active{
        transform: rotateZ(-360deg);
    }
`;

const isCreator = true;
const RedirectCreator = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useContext(StoreContext);
    const [userInfo, setUserInfo] = useState(null);
    const [did, setDid] = useState(null);
    const [waitForTransfer, setWaitForTransfer] = useState(-1);
    const [accBalance, setAccBalance] = useState(0);

    useEffect(() => {
        const getRedirectResult = async () => {
            console.log("getting redirect");
            try {
                const result = await state.magic.oauth.getRedirectResult();
                console.log(result);
                const idToken = await state.magic.user.getIdToken();
                setUserInfo(result.oauth.userInfo);
                setDid(idToken);
            } catch (error) {
                console.log(error);
            }
        };
        if (!state.magic) return;
        getRedirectResult();
    }, [state.magic]);

    useEffect(() => {
        login();
    }, [did]);

    const registerOnSC = async (isCreator) => {
        const magic = new Magic(
            process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY,
            {
                network: {
                    rpcUrl: process.env.REACT_APP_RPC_URL,
                    chainId: 80001,
                },
                extensions: [new OAuthExtension()],
            }
        );

        console.log(magic);

        const rpcProvider = new ethers.providers.Web3Provider(
            magic.rpcProvider
        );
        const signer = rpcProvider.getSigner();
        const contractInstance = new ethers.Contract(
            ContractAddress,
            ContractABI,
            signer
        );
        let resFromSC;

        if (isCreator) {
            resFromSC = await contractInstance.RegisterCreator(
                "Creator name",
                "youtube",
                1000
            );
            console.log(resFromSC);
        } else {
            resFromSC = await contractInstance.RegisterContributor(
                "Contributor name"
            );
            console.log(resFromSC);
        }
    };

    const login = async () => {
        if (!did) return;
        const loginUserInfo = await magicLogin(
            state,
            dispatch,
            did,
            userInfo,
            isCreator
        );
        console.log(loginUserInfo);
        if(!loginUserInfo.user_instance.walletAddress){
            navigate('/');
            toast.error("We ran into an error!");
            return;
        }
        if (loginUserInfo.isUserNew) {
            setWaitForTransfer(1);
            fetchAccountBalance(loginUserInfo.user_instance.walletAddress);
        } else {
            setWaitForTransfer(0);
        }
    };

    const handleNextClick = async () => {
        setWaitForTransfer(-1);
        const resFromSC = await registerOnSC(isCreator);
        navigate(isCreator ? '/dashboard' : '/home');
    }

    const fetchAccountBalance = async (walletAddress) => {

        const magic = new Magic(
            process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY,
            {
                network: {
                    rpcUrl: process.env.REACT_APP_RPC_URL,
                    chainId: 80001,
                },
                extensions: [new OAuthExtension()],
            }
        );

        const rpcProvider = new ethers.providers.Web3Provider(
            magic.rpcProvider
        );

        const balance = await rpcProvider.getBalance(walletAddress);
        console.log(balance);
        setAccBalance((parseInt(balance.toString())/1e18).toFixed(4));
    }

    const copyWalletAddress = () => {
        navigator.clipboard.writeText(state.user.walletAddress);
        toast.success("Copied to clipboard!", {autoClose: 1000});
    }

    useEffect(() => {
        if (waitForTransfer == 0) {
            navigate("/dashboard");
        }
    }, [waitForTransfer]);

    return (
        <RedirectPageContainer>
            {waitForTransfer == 1 ? (
                <WalletInfo>
                    <span>Wohooo, we have created a secure wallet for you! 🥳</span>
                    <AccountBalance>
                        <BalanceAmount>{accBalance}</BalanceAmount> MATIC
                        <ReloadWallet onClick={() => {fetchAccountBalance(state.user.walletAddress)}}>
                        <Replay />

                        </ReloadWallet>
                    </AccountBalance>
                    <AccountAddress>{state.user.emailId}</AccountAddress>
                    <AccountAddress>
                        {state.user.walletAddress.substring(0, 7)}..
                        {state.user.walletAddress.slice(-5)}{" "}
                        <ContentCopyRounded
                            onClick={copyWalletAddress}
                            style={{ marginLeft: "0.5rem", cursor: "pointer" }}
                            fontSize="10"
                        />
                    </AccountAddress>
                    <NextButton onClick={handleNextClick}>Next <ArrowForward color="#ffffff"/></NextButton>
                </WalletInfo>
            ) : <><CircularProgress
            size={90}
            thickness={2}
            style={{ color: "#F423BA" }}
        />
        <span>Creating a secure Web3 wallet...</span></>}
        </RedirectPageContainer>
    );
}

export default RedirectCreator;
