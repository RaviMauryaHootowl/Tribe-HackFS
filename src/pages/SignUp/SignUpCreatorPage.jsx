import React, { useContext } from "react";
import styled from "styled-components";
import logo from "../../images/logo.svg";
import headerbg from "../../images/headerbg.png";
import googleLogo from "../../images/googleLogo.png";
import orDividerImg from "../../images/orDivider.svg";
import { StoreContext } from "../../utils/Store";

const SignUpPageContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const SignUpHeroSection = styled.div`
    width: 100%;
    background-image: url(${headerbg});
    background-size: cover;
    background-position: center;
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
    padding: 4rem 2rem;
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

const SignUpCreatorPage = () => {
    const { state, dispatch } = useContext(StoreContext);

    const googleLoginHandler = async (e) => {
        e.preventDefault();
        const idToken = await state.magic.oauth.loginWithRedirect({
            provider: "google",
            redirectURI: `${process.env.REACT_APP_URL}/redirectCreator?link=/home`,
        });
        console.log(idToken);
    };

    return (
        <SignUpPageContainer>
            <SignUpHeroSection>
                <SignUpAppLogo src={logo} />
                <SubHeaderSpan>
                    A secure platform for Independent
                    <br />
                    creators to build a healthy community!
                </SubHeaderSpan>
            </SignUpHeroSection>
            <SignUpContentSection>
                <SignUpFormHeading>
                    Are you a creator?
                    <br />
                    Create your community
                </SignUpFormHeading>
                <SignUpGoogleButton onClick={googleLoginHandler}>
                    Sign Up with <GoogleLogo src={googleLogo} />
                </SignUpGoogleButton>
            </SignUpContentSection>
        </SignUpPageContainer>
    );
};

export default SignUpCreatorPage;
