import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import styled from "styled-components";
import cover from "../../images/cover.png";
import { CallEnd, MicOffRounded, SendRounded, VideoCameraBackRounded, VideoCameraFrontRounded, Videocam, ViewAgendaRounded } from "@mui/icons-material";
import { StoreContext } from "../../utils/Store";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import { ContractABI, ContractAddress } from "../../utils/constants";
import Sidebar from "../../components/Sidebar";
import { isValid } from "../../utils/utils";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import * as PushAPI from "@pushprotocol/restapi";

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
    align-items: start;
    width: 100%;
    padding: 1rem 2rem;
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
        transform: translateY(4px);
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

const PostTypeSwitchContainer = styled.div`
    display: flex;
    align-items: center;
`;

const CreateProjModalBottom = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const FullFlexDiv = styled.div`
    flex: 1;
`;

const SetupMessageContainer = styled.div`
    width: 100%;
    padding: 0 2rem;
    margin-top: 1rem;
`;

const SetupMessageBox = styled.div`
    width: 100%;
    border-radius: 8px;
    background-color: #3a3a3a;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SetupMessageBtn = styled.button`
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

const VoteViewContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const VoteBarView = styled.div`
    width: 100%;
    display: grid;
    column-gap: 1rem;
    place-items: center;
    grid-template-columns: auto 1fr;
    color: white;
`;

const VoteBarLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
`;

const VoteBarContainer = styled.div`
    height: 8px;
    width: 100%;
    background-color: white;
    border-radius: 50vh;
`;

const VoteBarFilled = styled.div`
    height: 8px;
    width: ${(props) => props.percent}%;
    background-color: #2ecc71;
    border-radius: 50vh;
`;

const VoteBarFilledRed = styled.div`
    height: 8px;
    width: ${(props) => props.percent}%;
    background-color: #e74c3c;
    border-radius: 50vh;
`;

const VotingModalActions = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 1rem;
`;

const TextViewGroup = styled.div`
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

const TextViewContent = styled.div`
    font: 1.1rem;
`;

const ActionButtonsList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

const ActionButton = styled.button`
    padding: 1rem 2rem;
    background-color: #ffffff1f;
    border-radius: 8px;
    outline: none;
    border: none;
    color: white;
    font-size: 1.3rem;
    cursor: pointer;
    transition: all 0.5s ease;
    display: flex;
    margin: 0 1rem 1rem 0;
    flex-direction: column;
    align-items: center;
    &:hover {
        background-color: #1e5ed9;
        color: white;
    }
`;

const ActionButtonIcon = styled.div`
    margin-bottom: 0.5rem;
`;

const ChatsWindowOuterContainer = styled.div`
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: row;
    padding: 2rem;
    overflow-y: hidden;
`;

const UserListContainer = styled.div`
    padding: 1rem;
    color: white;
    background-color: #474747;
    border-radius: 0.5rem;
`;

const UserCard = styled.div`
    cursor: pointer;
    padding: 8px;
    border-radius: 0.5rem;

    &:hover {
        background-color: #323232;
    }
`;

const ChatsWindow = styled.div`
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    background-color: #2f2f2f;
    color: white;
    overflow-y: hidden;
`;

const ChatsWindowHeader = styled.div`
    width: 100%;
    padding: 1rem;
    background-color: #393939;
    display: flex;
    align-items: center;
`;

const ChatWindowHeaderAvatar = styled.img`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    margin-right: 1rem;
`;

const ChatsListContainer = styled.div`
    width: 100%;
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: row;
`;

const VideoContainer = styled.div`
    background-color: black;
    flex: 1;
    margin: 1rem;
`;

const VideoCallActionsBar = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem;
`;

const VideoActionButton = styled.div`
    width: 3rem;
    height: 3rem;
    border-radius: 100vh;
    background-color: #575757;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content:center;
    margin-right: 1rem;
`;
const VideoActionButtonRed = styled.div`
    width: 3rem;
    height: 3rem;
    border-radius: 100vh;
    background-color: #e83636;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content:center;
`;

const ChatsListContainerScroll = styled.div`
    width: 100%;
`;

const ChatsMessageInputContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding: 1rem;
`;

const ChatMessageInput = styled.input`
    flex: 1;
    font-size: 1.1rem;
    background-color: #393939;
    border: none;
    outline: none;
    padding: 0.6rem 1rem;
    color: white;
`;
const ChatSendBtn = styled.button`
    margin-left: 1rem;
    background-color: #258e25;
    border: none;
    outline: none;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.5s ease;
    &:hover {
        transform: rotate(-20deg);
    }
    &:active {
        transform: scale(0.9);
    }
`;

const ChatBubbleContainer = styled.div`
    padding: 0.3rem 0rem;
    display: flex;
    justify-content: ${(props) => (props.isMe ? "end" : "start")};
`;

const ChatBubble = styled.div`
    max-width: 40%;
    background-color: ${(props) => (props.isMe ? "#a9ffca" : "#9e9eff")};
    border: ${(props) => (props.isCreator ? "#ff4eaf" : "#00000000")} solid 5px;
    color: black;
    border-radius: 1rem;
    padding: 0.5rem 1rem;
`;

const ChatAuthor = styled.div`
    font-size: 0.9rem;
    font-weight: bold;
`;

const ChatTime = styled.div`
    font-size: 0.9rem;
    color: #343434;
    text-align: right;
`;

const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: "2px",
    borderRadius: "1rem",
    borderColor: "#E3E3E3",
    backgroundColor: "#4b4b4b56",
    color: "#6e6e6e",
    outline: "none",
    transition: "border .24s ease-in-out",
    cursor: "pointer",
};

const focusedStyle = {
    borderColor: "#2196f3",
};

const acceptStyle = {
    borderColor: "#00e676",
};

const rejectStyle = {
    borderColor: "#ff1744",
};

const PushVideoCall = () => {
    const { state, dispatch } = useContext(StoreContext);
    const params = useParams();
    const navigate = useNavigate();
    const [creatorInfo, setCreatorInfo] = useState({});
    const [isMember, setIsMember] = useState(false);
    const [chatBody, setChatBody] = useState("");
    const [chatsList, setChatsList] = useState([]);
    const [requestsList, setrequestsList] = useState([]);
    const [whomToSend, setWhomToSend] = useState("");
    const [groupInfo, setGroupInfo] = useState({});


    const createUser = async () => {

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
        const signer = rpcProvider.getSigner();
    
        const user = await PushAPI.user.create({
          signer: signer,
          env: "staging",
        });
        console.log(user);
    
    }

    const fetchUserChats = async () => {
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
        const signer = rpcProvider.getSigner();
        const address = await signer.getAddress();
        const user = await PushAPI.user.get({
          account: `eip155:${address}`,
          env: "staging",
        });
    
        const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey,
          signer: signer,
        })
    
        const response = await PushAPI.chat.chats({
          account: `eip155:${address}`,
          toDecrypt: true,
          pgpPrivateKey: pgpDecrpyptedPvtKey,
          env: "staging",
        });
        console.log(response);
      }

      const sendPushMessage = async (toAddress, message) => {
        console.log(toAddress);
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
        const signer = rpcProvider.getSigner();
        const address = await signer.getAddress();
    
        const user = await PushAPI.user.get({
            account: `eip155:${address}`,
            env: "staging",
        });
          
        // need to decrypt the encryptedPvtKey to pass in the api using helper function
        const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
            encryptedPGPPrivateKey: user.encryptedPrivateKey, 
            signer: signer
        });
        
        // actual api
        const response = await PushAPI.chat.send({
          messageContent: message,
          messageType: 'Text', // can be "Text" | "Image" | "File" | "GIF" 
          receiverAddress: `${toAddress}`,
          signer: signer,
          pgpPrivateKey: pgpDecryptedPvtKey,
          env: "staging"
        });
        setChatBody("");
        console.log(response);
      }

      const fetchAllChatRequests = async () => {
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
        const signer = rpcProvider.getSigner();
        const address = await signer.getAddress();
    
        const user = await PushAPI.user.get({
            account: `eip155:${address}`,
            env: "staging",
        });
    
        // need to decrypt the encryptedPvtKey to pass in the api using helper function
        const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey, 
          signer: signer
        });
        
        // Actual api
        const response = await PushAPI.chat.requests({
            account: `eip155:${address}`,
            toDecrypt: true,
            pgpPrivateKey: pgpDecryptedPvtKey,
            env: "staging",
        });
        console.log(response);
        setrequestsList(response);

      }

      const fetchAllPushChats = async (toAddress) => {
        if(toAddress === ""){ return; }
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
        const signer = rpcProvider.getSigner();
        const address = await signer.getAddress();
    
        const user = await PushAPI.user.get({
            account: `eip155:${address}`,
            env: "staging",
        });
    
        // need to decrypt the encryptedPvtKey to pass in the api using helper function
        const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
          encryptedPGPPrivateKey: user.encryptedPrivateKey, 
          signer: signer
        });
    
        // conversation hash are also called link inside chat messages
        let conversationHash = await PushAPI.chat.conversationHash({
          account: `eip155:${address}`,
          conversationId: `${toAddress}`, // receiver's address or chatId of a group
          env: "staging",
        });

        console.log(conversationHash);

        if(!conversationHash.threadHash){
            await sendPushMessage(toAddress, "Hey there!");
            conversationHash = await PushAPI.chat.conversationHash({
                account: `eip155:${address}`,
                conversationId: `${toAddress}`, // receiver's address or chatId of a group
                env: "staging",
            });
            console.log(conversationHash);
        }
    
        // actual api
        const chatHistory = await PushAPI.chat.history({
          threadhash: conversationHash.threadHash,
          account: `eip155:${address}`,
          limit: 10,
          toDecrypt: true,
          pgpPrivateKey: pgpDecryptedPvtKey,
          env: "staging",
        });
    
        console.log(chatHistory);
        let chats = chatHistory.map((chat) => {
            return {...chat, walletAddress: chat.fromDID.substring(7)}
        });
        chats.reverse();
        setChatsList(chats);
    
      }

      const fetchGroupInfo = async (chatId) => {
        const response = await PushAPI.chat.getGroup({
            chatId: chatId,
            env: "staging"
        });
        console.log(response);

        setGroupInfo(response);
      }


    useEffect(() => {
        console.log(state.user);
        if(state.user.walletAddress){
        }
    }, [state.user]);

    useEffect(() => {
        console.log(params.id);
        fetchCreatorInfo(params.id);
    }, [params]);

    const [count, setCount] = useState(0);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if(creatorInfo.walletAddress){
    //             fetchAllPushChats(whomToSend);
    //         }
    //         console.log("fetced");
    //         setCount(count+1);
    //     }, 6000);
    //     return () => clearTimeout(timer);
    // }, [count]);

    // useEffect(() => {
    //     fetchAllPushChats(whomToSend);
    //     fetchAllChatRequests();
    // }, [whomToSend]);

    const fetchCreatorInfo = async (id) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API}/user/getCreatorInfo?walletAddress=${id}`
            );
            console.log(res.data);
            const memberFind = res.data.members.find(
                (o) => o.emailId == state.user.emailId
            );
            if (memberFind) {
                setIsMember(true);
            } else {
                setIsMember(false);
            }
            setCreatorInfo(res.data);
            setWhomToSend(res.data.chatId);
            fetchGroupInfo(res.data.chatId);
            // fetchAllChats(res.data.walletAddress);
            // getMilestoneDetails(res.data.walletAddress);
            // getVoteDetails(res.data.walletAddress);
        } catch (err) {
            console.log(err);
            setCreatorInfo({});
        }
    };

    return (
        <OuterFrameContainer>
            <Sidebar />
            <CreatorPageContainer>
                <Navbar title={"VIDEO CALL"} />
                <ChatsWindowOuterContainer>
                    <ChatsWindow>
                        <ChatsWindowHeader>
                            <ChatWindowHeaderAvatar
                                src={creatorInfo.profilePic}
                            />
                            {creatorInfo.fullName}
                        </ChatsWindowHeader>
                        <ChatsListContainer>
                            <VideoContainer>
                                
                            </VideoContainer>
                            <VideoContainer>

                            </VideoContainer>
                        </ChatsListContainer>
                        <VideoCallActionsBar>
                            <VideoActionButton>
                                <MicOffRounded />
                            </VideoActionButton>
                            <VideoActionButton>
                                <VideoCameraBackRounded />
                            </VideoActionButton>
                            <VideoActionButtonRed>
                                <CallEnd />
                            </VideoActionButtonRed>
                        </VideoCallActionsBar>
                    </ChatsWindow>
                </ChatsWindowOuterContainer>
            </CreatorPageContainer>
        </OuterFrameContainer>
    );
};

export default PushVideoCall;
