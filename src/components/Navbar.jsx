import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { StoreContext } from "../utils/Store";
import { logoutHandler } from "../utils/user";
import { useNavigate } from "react-router-dom";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import Avatar, { genConfig } from 'react-nice-avatar';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from "react-toastify";
import { addressToAvatarResolution, addressToENSNameResolution, nameToAvatarResolution } from "../utils/utils";

const HomeNavbar = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items:center;
    margin-top: 3rem;
    padding: 0 2rem;
`;

const PageHeader = styled.div`
    font-weight: bold;
    color: #dbdbdb;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
`;

const NavbarActions = styled.div`
    display: flex;
    align-items:center;
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

const LogoutBtn = styled.button`
    background-color: #e4e4e4;
    border: none;
    outline: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.5s ease;
`;

const DropdownGroup = styled.div`
    position: relative;
`;

const AvatarIcon = styled.div`
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    /* background-color: #ff3d3d; */
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover{
        transform: rotateZ(20deg) translateY(-4px);
    }
`;

const DropdownContainer = styled.div`
    background-color: #161616;
    box-shadow: #0000006c 4px 4px 12px;
    border: solid white 2px;
    border-radius: 0.5rem;
    padding: 1rem;
    display: ${props => props.isOpen ? "flex" : "none"};
    transition: all 0.5s ease;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 3.5rem;
    z-index: 1000;
`;


const Navbar = ({title}) => {
    const { state, dispatch } = useContext(StoreContext);
    const navigate = useNavigate();
    const [accBalance, setAccBalance] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const config = genConfig(state.user.emailId);
    const [ensName, setEnsName] = useState("");
    const [ensAvatar, setEnsAvatar] = useState("");

    useEffect(() => {
        if(state.user.walletAddress){
            fetchAccountBalance();
            fetchENSName();
        }
    }, [state.user]);

    const fetchENSName =  async () => {
        const name = await addressToENSNameResolution("0x708B52c67512f7CA6CBCd3660cCB109FA9027461");
        // const name = await addressToENSNameResolution(state.user.walletAddress);
        console.log(name);
        // const uri = await nameToAvatarResolution(name);
        // console.log(uri);
        if(name) {
            setEnsName(name);
            // setEnsAvatar(uri);
        }else{
            setEnsName("");
            // setEnsAvatar("");
        }
    }

    const toggleDropdown = () => {
        fetchAccountBalance();
        setIsDropdownOpen(!isDropdownOpen);
    }

    const fetchAccountBalance = async () => {
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

        const balance = await rpcProvider.getBalance(state.user.walletAddress);
        setAccBalance((parseInt(balance.toString())/1e18).toFixed(4));
    }

    const copyWalletAddress = () => {
        navigator.clipboard.writeText(state.user.walletAddress);
        toast.success("Copied to clipboard!", {autoClose: 1000});
    }

    return (
        <HomeNavbar>
            <PageHeader>{title}</PageHeader>
            <NavbarActions>
                <DropdownGroup>
                    <AvatarIcon onClick={toggleDropdown}>
                        <Avatar style={{width: "2.5rem", height: "2.5rem"}} {...config} />
                    </AvatarIcon>
                    <DropdownContainer isOpen={isDropdownOpen}>
                        <AccountBalance><BalanceAmount>{accBalance}</BalanceAmount> MATIC</AccountBalance>
                        {
                            state.user.emailId !== "" && <AccountAddress>{state.user.emailId}</AccountAddress>
                        }
                        {
                            ensName !== "" && <AccountAddress>ENS: {ensName}</AccountAddress>
                        }
                        <AccountAddress>{state.user.walletAddress.substring(0, 7)}..{state.user.walletAddress.slice(-5)} <ContentCopyIcon onClick={copyWalletAddress} style={{marginLeft: '0.5rem', cursor: 'pointer'}} fontSize="10"/></AccountAddress>
                        <LogoutBtn onClick={() => {
                            logoutHandler(dispatch);
                            navigate("/");
                        }}>LOGOUT</LogoutBtn>
                    </DropdownContainer>
                </DropdownGroup>

            </NavbarActions>
        </HomeNavbar>
    );
};

export default Navbar;