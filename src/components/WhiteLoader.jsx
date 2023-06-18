import { CircularProgress } from "@mui/material";
import React from "react";
import styled from "styled-components";

const LoadingContainer = styled.div`
    display: flex;
    color: white;
    span{
        margin-right: 0.5rem;
    }
`;

const WhiteLoader = ({label}) => {
    return <LoadingContainer>
        <CircularProgress style={{color: "white"}} size={23}/>
        <span>{label}</span>

    </LoadingContainer>
}

export default WhiteLoader;