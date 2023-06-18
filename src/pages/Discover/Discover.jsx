import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import litIcon from "../../images/lit.svg";
import Modal from "react-modal";
import { StoreContext } from "../../utils/Store";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const createProjectModalStyles = {
    content: {
        width: "90%",
        maxWidth: "600px",
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        transform: "translate(-50%, -50%)",
        borderRadius: "1rem",
        border: "0",
        backgroundImage: "linear-gradient(to bottom, #242329, #242329)",
    },
    overlay: {
        background: "#000000a6",
        zIndex: 1000,
    },
};

const OuterFrameContainer = styled.div`
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    background-color: #19181d;
    align-items: stretch;
`;

const CreatorPageContainer = styled.div`
    width: 100%;
    height: 100vh;
    background-color: #242329;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

const CreatorsListGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    width: 100%;
    padding: 1rem 2rem;
`;

const BecomeMemberBtn = styled.button`
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
        transform: translateY(4px) rotateZ(2deg);
    }
`;

const CreateProjModalContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const ModalHeader = styled.span`
    font-weight: bold;
    color: white;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-align: center;
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
    flex-direction: column;
    display: flex;

    span {
        font-size: 0.9rem;
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

const CreateProjModalBottom = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`;

const FullFlexDiv = styled.div`
    flex: 1;
`;

const CreatorCard = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem;
    background-color: #474747;
    color: white;
    border-radius: 1rem;
    margin-bottom: 1rem;
    color: black;
    cursor: pointer;
`;

const CreatorProfilePic = styled.img`
    width: 5rem;
    height: 5rem;
    border-radius: 50vh;
    object-fit: cover;
`;

const CreatorDetails = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 1rem;
    color: white;
`;

const CreatorName = styled.span`
    font-size: 1.3rem;
    font-weight: bold;
`;

const CreatorStats = styled.span`
    display: flex;
    align-items: center;
    font-size: 1.2rem;

    img{
        margin-left: 0.3rem;
        height: 1.2rem;
    }
`;

const EmptyFeedContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;
    color: #8f8f8f;
`;

const CreatorsTopActions = styled.div`
    padding: 1rem 2rem;
    display: flex;
`;

const CreatorsFilterContainer = styled.div`
    display: flex;
    flex-direction: row;
    background-color: #474747;
    border-radius: 8px;
    overflow: hidden;
`;

const CreatorsFilter = styled.button`
    padding: 0.8rem 1rem;
    background-color: ${(props) => props.isSelected ? "#1660EE" : "#00000000"};
    color: white;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.5s ease;
    font-size: 1.02rem;
    
    &:hover{
        background-color: #4c8afe;
    }
`;

const Discover = () => {
    const { state, dispatch } = useContext(StoreContext);
    const navigate = useNavigate();
    const [creatorsList, setCreatorsList] = useState([]);
    const [filterMode, setFilterMode] = useState(1);

    useEffect(() => {
        console.log(state.user);
    }, [state.user]);

    useEffect(() => {
        fetchCreatorsList();
    }, []);

    useEffect(() => {
        fetchCreatorsList();
    }, [filterMode]);

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
        useState(false);

    const closeCreateProjectModal = () => {
        setIsCreateProjectModalOpen(false);
    };

    const openCreateProjectModal = () => {
        setIsCreateProjectModalOpen(true);
    };

    const fetchCreatorsList = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API}/user/getAllCreators`
            );
            console.log(res.data);
            if(filterMode == 1){
                res.data.sort((b,a) => (a.members.length > b.members.length) ? 1 : ((b.members.length > a.members.length) ? -1 : 0));
            }else{
                res.data.reverse();
            }
            setCreatorsList(res.data);
        } catch (err) {
            console.log(err);
            setCreatorsList([]);
        }
    };

    return (
        <OuterFrameContainer>
            <Modal
                isOpen={isCreateProjectModalOpen}
                onRequestClose={closeCreateProjectModal}
                style={createProjectModalStyles}
            >
                <CreateProjModalContainer>
                    <ModalHeader>Create Project</ModalHeader>
                    <TextInputGroup>
                        <span>Project Name</span>
                        <CustomInput
                            type="text"
                            name=""
                            id=""
                            placeholder="What are you creating?"
                        />
                    </TextInputGroup>
                    <TextInputGroup>
                        <span>Project Description</span>
                        <CustomInput
                            type="text"
                            name=""
                            id=""
                            placeholder="Describe your project mentioning amount breakdown"
                        />
                    </TextInputGroup>
                    <TextInputGroup>
                        <span>Project Cover Image</span>
                        <CustomInput type="text" name="" id="" placeholder="" />
                    </TextInputGroup>
                    <CreateProjModalBottom>
                        <FullFlexDiv>
                            <TextInputGroup>
                                <span>Required Amount</span>
                                <CustomInput
                                    type="text"
                                    name=""
                                    id=""
                                    placeholder="₹"
                                />
                            </TextInputGroup>
                        </FullFlexDiv>
                        <BecomeMemberBtn>Create</BecomeMemberBtn>
                    </CreateProjModalBottom>
                </CreateProjModalContainer>
            </Modal>
            <Sidebar />
            <CreatorPageContainer>
                <Navbar title={"DISCOVER CREATORS"} />
                <CreatorsTopActions>
                    <CreatorsFilterContainer>
                        <CreatorsFilter isSelected={filterMode == 1}
                            onClick={() => { setFilterMode(1); }}
                        >Most Popular</CreatorsFilter>
                        <CreatorsFilter isSelected={filterMode == 2}
                            onClick={() => { setFilterMode(2); }}
                        >New Talents</CreatorsFilter>
                    </CreatorsFilterContainer>
                </CreatorsTopActions>
                {
                    creatorsList.length == 0 && <EmptyFeedContainer>No Creators Found</EmptyFeedContainer>
                }
                <CreatorsListGrid>
                    {creatorsList.map((creator, index) => {
                        return (
                            <CreatorCard
                                onClick={() => {
                                    navigate(
                                        `/creator/${creator.walletAddress}`
                                    );
                                }}
                            >
                                <CreatorProfilePic src={creator.profilePic != "" ? creator.profilePic : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png"} />
                                <CreatorDetails>
                                    <CreatorName>{creator.fullName}</CreatorName>
                                    <CreatorStats>{creator.members.length} <img src={litIcon} /> </CreatorStats>
                                </CreatorDetails>
                            </CreatorCard>
                        );
                    })}
                </CreatorsListGrid>
            </CreatorPageContainer>
        </OuterFrameContainer>
    );
};

export default Discover;
