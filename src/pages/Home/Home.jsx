import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import logo from "../../images/logo.svg";
import cover from "../../images/cover.png";
import dp from "../../images/dp.png";
import spotify from "../../images/spotify.png";
import youtube from "../../images/youtube.png";
import music from "../../images/musicImage.png";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import Modal from "react-modal";
import { Add, CloseOutlined, UploadFile } from "@mui/icons-material";
import { StoreContext } from "../../utils/Store";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import moment from "moment/moment";
import { addressToENSNameResolution } from "../../utils/utils";

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

const SideBarMenu = styled.div`
    padding: 2rem;
    width: 400px;
`;

const CreatorPageContainer = styled.div`
    width: 100%;
    height: 100vh;
    background-color: #242329;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
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

    span {
        margin-left: 0.5rem;
    }

    :hover {
        background-color: #383838;
        color: #538bf3;
    }
`;

const CoverImageContainer = styled.div`
    width: 100%;
    height: 250px;
    flex-shrink: 0;
    background-image: url(${cover});
    background-position: center;
    background-size: cover;
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
`;

const CoverTopActions = styled.div`
    flex: 1;
`;

const CoverCreatorInfoContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
`;

const ProfilePicContainer = styled.div`
    position: relative;
    width: 200px;
`;

const ProfilePic = styled.img`
    height: 200px;
    width: 200px;
    border-radius: 50%;
    position: absolute;
    top: -100px;
`;

const InfoContainer = styled.div`
    flex: 1;
    padding-left: 1rem;
    color: white;
    display: flex;
    flex-direction: column;
`;

const CoverCreatorName = styled.div`
    font-weight: bold;
    font-size: 3rem;
`;

const CoverStatsContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex: 1;
`;

const CoverStat = styled.div`
    margin-right: 1rem;
    font-size: 1.1rem;
`;

const CoverMilestoneStat = styled.div`
    display: flex;
    flex-direction: column;
    color: white;
    align-items: center;
`;

const MilestoneMeter = styled.div`
    width: 120px;
    height: 5px;
    background-color: white;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    border-radius: 5px;
    overflow: hidden;
`;

const FilledMeter = styled.div`
    width: 70%;
    background-color: #1e5ed9;
`;

const FeedContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem 2rem;
    color: #8f8f8f;
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

const PostCard = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 500px;
    background-color: #3B3B3B;
    margin-bottom: 2rem;
    border-radius: 8px;
    color: white;
    border-left: ${(props) => props.isMemberOnly ? "5px" : "0px"} solid #F423BA;
`;

const PostCredits = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: 1rem;
`;

const PostCreatorPic = styled.div`
    width: 2.5rem;
    height: 2.5rem;
    background-image: url("${(props) => props.src}");
    background-position: center;
    background-size: cover;
    border-radius: 50%;
    margin-right: 1rem;
`;

const PostCreatorNameWithDate = styled.div`
    display: flex;
    flex-direction: column;
`;

const PostCreatorName = styled.div`
    font-size: 1.1rem;
`;
const PostDate = styled.div`
    color: #878787;
`;

const PostImage = styled.img`
    width: 100%;
`;

const PostContent = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
`;

const PostCaption = styled.div`
    
`;

const TopFeedActionsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const BlankSpace = styled.div`
    width: 200px;
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

const FollowBtn = styled.button`
    margin-left: 1rem;
    background-color: #e4e4e4;
    border: none;
    outline: none;
    border-bottom: #8e8e8e 6px solid;
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

const HomeNavbar = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 3rem;
    padding: 0 2rem;
`;

const PageHeader = styled.div`
    font-weight: bold;
    color: #dbdbdb;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
`;

const AccountAddress = styled.div`
    font-weight: bold;
    color: #dbdbdb;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
`;

const FeedSection = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    color: #828282;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
`;

const SectionHeaderActionBtn = styled.button`
    margin-left: 1rem;
    background-color: #e4e4e4;
    border: none;
    outline: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    /* margin-top: 2rem; */
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.5s ease;
`;

const StoryText = styled.div`
    color: #d1d1d1;
`;

const WorkListContainer = styled.div`
    display: flex;
    flex-direction: row;
`;

const WorkCard = styled.div`
    background-color: #3c3c3c;
    margin-right: 0.8rem;
    color: #dddddd;
    padding: 0.8rem 1rem;
    display: flex;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.5s ease;

    img {
        height: 1.5rem;
        margin-right: 0.8rem;
    }

    &:hover {
        transform: translateY(-2px);
    }
    &:active {
        transition: all 0.1s ease;
        transform: translateY(4px);
    }
`;

const ProjectsCard = styled.div`
    background-color: #3c3c3c;
    margin-right: 0.8rem;
    color: #dddddd;
    display: flex;
    align-items: center;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.5s ease;

    img {
        height: 5rem;
    }

    span {
        padding: 0.8rem;
        font-weight: 600;
    }
    &:hover {
        transform: translateY(-2px);
    }
    &:active {
        transition: all 0.1s ease;
        transform: translateY(4px);
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

const Home = () => {
    const { state, dispatch } = useContext(StoreContext);
    const navigate = useNavigate();
    const [postList, setPostList] = useState([]);

    useEffect(() => {
        console.log(state.user);
        if (state.user.emailId) {
            
            fetchPosts(state.user.emailId);
        }
    }, [state.user]);

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
        useState(false);

    const closeCreateProjectModal = () => {
        setIsCreateProjectModalOpen(false);
    };

    const openCreateProjectModal = () => {
        setIsCreateProjectModalOpen(true);
    };

    const fetchPosts = async (emailId) => {
        try {
            const postRes = await axios.get(
                `${process.env.REACT_APP_API}/post/getByUserWallet?emailId=${emailId}`
            );
            console.log(postRes.data);
            setPostList(postRes.data);
        } catch (e) {
            console.log(e);
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
                <Navbar title={"HOME"} />
                {
                    postList.length == 0 && <EmptyFeedContainer>No Posts</EmptyFeedContainer>
                }
                <FeedContainer>
                    {postList.map((post, index) => {
                        return (
                            <PostCard id={index} isMemberOnly={post.isMemberOnly}>
                                <PostCredits><PostCreatorPic src={post.profilePic} /> 
                                    <PostCreatorNameWithDate>
                                        <PostCreatorName>{post.fullName}</PostCreatorName>
                                        <PostDate>{moment(post.createdAt).format("DD/MM/YYYY, h:mm A")}</PostDate>
                                    </PostCreatorNameWithDate>
                                </PostCredits>
                                <PostImage src={post.picUrl} />
                                <PostContent>
                                    <PostCaption>{post.caption}</PostCaption>
                                </PostContent>
                            </PostCard>
                        );
                    })}
                </FeedContainer>
            </CreatorPageContainer>
        </OuterFrameContainer>
    );
};

export default Home;
