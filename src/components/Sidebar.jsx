import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import logo from "../images/logo.svg";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import { StoreContext } from "../utils/Store";

const SideBarMenu = styled.div`
    padding: 2rem;
    width: 400px;
`;

const AppLogo = styled.img`
    height: 2.2rem;
    margin: 1rem;
    margin-bottom: 2rem;
`;

const SideOptionCard = styled.div`
    display: flex;
    align-items: center;
    color: #bababa;
    font-size: 1.1rem;
    font-weight: 500;

    border-radius: 8px;
    padding: 0.6rem 1rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.5s ease;
    background-color: ${(props) => props.isSelected ? "#383838" : "#00000000"};

    span {
        margin-left: 0.5rem;
    }

    :hover {
        background-color: #383838;
        color: #538bf3;
    }
`;

const Sidebar = () => {
    const { state, dispatch } = useContext(StoreContext);
    const location = useLocation();
    const navigate = useNavigate();

    const pathname = location.pathname;

    return (
        <SideBarMenu>
            <AppLogo src={logo} />
            {state.user.isCreator ? (
                <SideOptionCard
                    isSelected={pathname.includes("dashboard")}
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                >
                    <HomeRoundedIcon />
                    <span>Dashboard</span>
                </SideOptionCard>
            ) : (
                <SideOptionCard
                    isSelected={pathname.includes("home")}
                    onClick={() => {
                        navigate("/home");
                    }}
                >
                    <HomeRoundedIcon />
                    <span>Home</span>
                </SideOptionCard>
            )}
            <SideOptionCard
                isSelected={pathname.includes("discover")}
                onClick={() => {
                    navigate("/discover");
                }}
            >
                <TravelExploreRoundedIcon />
                <span>Discover</span>
            </SideOptionCard>
            <SideOptionCard
                isSelected={pathname.includes("crypts")}
                onClick={() => {
                    navigate("/crypts");
                }}
            >
                <LocalFireDepartmentRoundedIcon />
                <span>Crypts</span>
            </SideOptionCard>
            <SideOptionCard
                isSelected={pathname.includes("account")}
            >
                <AccountCircleRoundedIcon />
                <span>Account</span>
            </SideOptionCard>
            <SideOptionCard
                isSelected={pathname.includes("settings")}
            >
                <SettingsSuggestRoundedIcon />
                <span>Settings</span>
            </SideOptionCard>
        </SideBarMenu>
    );
};

export default Sidebar;
