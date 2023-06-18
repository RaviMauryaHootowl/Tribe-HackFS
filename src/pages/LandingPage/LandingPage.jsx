import React, { useContext } from "react";
import styled from "styled-components";
import logo from "../../images/logo.svg";
import landingbg from "../../images/landingbg.png";
import orDividerImg from "../../images/orDivider.svg";
import { StoreContext } from "../../utils/Store";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const LandingPageContainer = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-image: url(${landingbg});
    background-size: cover;
    background-position: center;
`;

const LandingPageHeader = styled.div`
    width: 100%;
    padding: 5rem 2rem;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const SignUpAppLogo = styled.img`
    height: 4rem;
    margin-bottom: 2rem;
`;

const SubHeaderSpan = styled.span`
    font-size: 1.2rem;
    text-align: center;
`;

const SignUpContentSection = styled.div`
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
`;

const SignUpFormHeading = styled.div`
    font-size: 1.6rem;
    font-weight: 600;
    text-align: center;
`;

const SignUpGoogleButton = styled.button`
    background-color: #e4e4e4;
    border: none;
    outline: none;
    border-bottom: #8e8e8e 6px solid;
    padding: 0.8rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    margin-top: 2rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover {
        transform: translateY(-2px);
    }
    &:active {
        transition: all 0.1s ease;
        transform: translateY(4px) rotateZ(2deg);
    }
`;

const GoogleLogo = styled.img`
    height: 2rem;
    margin-left: 0.4rem;
`;

const OrDivider = styled.img`
    margin: 2rem;
    height: 1rem;
`;

const TextInputGroup = styled.div`
    background-color: #161616;
    color: white;
    border-radius: 6px;
    border: none;
    outline: none;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    width: 300px;
    flex-direction: column;
    display: flex;

    span {
        font-size: 0.8rem;
        font-weight: bold;
        margin-bottom: 0.6rem;
        color: #c1c1c1;
    }
`;

const CustomInput = styled.input`
    background-color: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 1.1rem;
`;

const SignUpButton = styled.button`
    background-color: #8216ee;
    color: white;
    border: none;
    outline: none;
    border-bottom: #6a1ab9 6px solid;
    padding: 0.8rem 2rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    margin-top: 2rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover {
        transform: translateY(-2px);
    }
    &:active {
        transition: all 0.1s ease;
        transform: translateY(4px) rotateZ(2deg);
    }
`;

const ActionsContainer = styled.div`
    display: flex;
    align-items: center;
    margin-top: 1rem;
`;

const ActionButtonCreator = styled.button`
    padding: 1rem 2rem;
    margin: 0.5rem;
    background-color: #ffffff36;
    border-radius: 8px;
    outline: none;
    border: none;
    color: white;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover{
        background-color: #F423BA;
        color: white;
    }
`;

const ActionButtonUser = styled.button`
    padding: 1rem 2rem;
    margin: 0.5rem;
    background-color: #ffffff36;
    border-radius: 8px;
    outline: none;
    border: none;
    color: white;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover{
        background-color: #1E5ED9;
        color: white;
    }
`;

const LandingPage = () => {
    const { state, dispatch } = useContext(StoreContext);
    const navigate = useNavigate();

    const googleLoginHandler = async (e) => {
        e.preventDefault();
        const idToken = await state.magic.oauth.loginWithRedirect({
            provider: "google",
            redirectURI: `${process.env.REACT_APP_URL}/redirect?link=/home`,
        });
        console.log(idToken);
    };

    return (
        <LandingPageContainer>
            <LandingPageHeader>
                <SignUpAppLogo src={logo} />
                <SubHeaderSpan>
                    A secure, self-sustaining and decentralized platform
                    <br />
                    for Independent creators to build a healthy community!
                </SubHeaderSpan>
                <ActionsContainer>
                    <ActionButtonCreator onClick={() => {
                        navigate('/signupCreator')
                    }}>Creator</ActionButtonCreator>
                    <ActionButtonUser onClick={() => {
                        navigate('/signup')
                    }}>User</ActionButtonUser>
                </ActionsContainer>
            </LandingPageHeader>
        </LandingPageContainer>
    );
};

export default LandingPage;
