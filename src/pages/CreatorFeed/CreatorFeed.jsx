import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import cover from "../../images/cover.png";
import { NotificationItem, chainNameType } from "@pushprotocol/uiweb";
import Modal from "react-modal";
import {
  Add,
  CloseOutlined,
  UploadFile,
  ViewTimelineRounded,
} from "@mui/icons-material";
import * as PushAPI from "@pushprotocol/restapi";
import { StoreContext } from "../../utils/Store";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { ethers } from "ethers";
import { ContractABI, ContractABINFT, ContractAddress, ContractAddressNFT } from "../../utils/constants";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";
import WhiteLoader from "../../components/WhiteLoader";
import moment from "moment";
import { isValid } from "../../utils/utils";
import { Web3Storage } from "web3.storage";
import html2canvas from "html2canvas";

import {
    getSubs,
    subscribe,
    getNotifications,
    sendNotif,
  } from "../../contexts/Push";

const createProjectModalStyles = {
    content: {
        width: "90%",
        maxWidth: "600px",
        maxHeight: "80vh",
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

const ProfilePic = styled.div`
  height: 200px;
  width: 200px;
  background-image: url("${(props) => props.src}");
  background-position: center;
  background-size: cover;
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
  height: 30px;
  background-color: white;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  overflow: hidden;
  margin: 0.2rem 0;
  overflow: hidden;
  position: relative;
`;

const MilestoneMeterLabel = styled.div`
  color: black;
  font-weight: bold;
  z-index: 100;
`;

const FilledMeter = styled.div`
  position: absolute;
  left: 0;
  width: calc(${(props) => props.percent}*1.2px);
  height: 30px;
  background-color: #7da8f7;
  border-radius: 15px;
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem 2rem;
`;

const TopFeedActionsContainer = styled.div`
  width: 100%;
  min-height: 3rem;
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
    height: 1.4rem;
    margin-right: 0.6rem;
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

const NFTTemplateImg = styled.div`
    width: 200px;
    height: 400px;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const NFTImageTop = styled.div`
    flex: 9;
`

const NFTImageBottom = styled.div`
    flex: 2;
    color: #e32a2a;
    font-family: 'RedHatMono', monospace;
    font-size: ${props => (props.big ? "1rem" : "1rem")};
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
  justify-content: center;
`;

const FullFlexDiv = styled.div`
  flex: 1;
`;

const PostCard = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  background-color: #3b3b3b;
  margin-bottom: 2rem;
  border-radius: 8px;
  color: white;
  border-left: ${(props) => (props.isMemberOnly ? "5px" : "0px")} solid #f423ba;
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

const NotifItem = styled.div`
  position: absolute;
  right: 25px;
`;

const PostCaption = styled.div``;

const CreatorFeed = ({ match }) => {
    const params = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useContext(StoreContext);
    const [creatorInfo, setCreatorInfo] = useState({});
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
        useState(false);
    const [isBecomeMemberModalOpen, setIsBecomeMemberModalOpen] =
        useState(false);
    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [becomeMemberValue, setBecomeMemberValue] = useState();
    const [nftNameValue, setNftNameValue] = useState("");
    const [isMember, setIsMember] = useState(false);
    const [milestoneInfo, setMilestoneInfo] = useState({});
    const [votingInfo, setVotingInfo] = useState({});
    const [isBecomeMemberLoading, setIsBecomeMemberLoading] = useState(false);
    const [isVotingLoading, setIsVotingLoading] = useState(false);
    const [postList, setPostList] = useState([]);
    const web3Storage = new Web3Storage({ token: process.env.REACT_APP_WEB3_STORAGE_API });
  const [addr, setAddr] = useState();
  const [notif, setNotif] = useState([]);
  const [
    oneNotif = {
      id: 0,
      title: "",
      message: "",
      cta: "",
      app: "",
      icon: "",
      image: "",
      url: "",
      blockchain: "",
    },
    setOneNotif,
  ] = useState();

  useEffect(() => {
    console.log("state.user", state.user);
    setAddr(state.user.Address);
  }, [state.user]);

  useEffect(() => {
    if (state.user.emailId && creatorInfo.emailId) {
      fetchNotifications();
      fetchPosts(state.user.emailId, creatorInfo.emailId);
    }
  }, [state.user, creatorInfo]);

  useEffect(() => {
    console.log("params.id", params.id);
    fetchCreatorInfo(params.id);
  }, [params]);

  useEffect(() => {
    console.log("OneNotif", oneNotif);
  }, [oneNotif]);

  useEffect(() => {
    console.log(milestoneInfo);
  }, [milestoneInfo]);

  const fetchNotifications = async () => {
    console.log("addr", addr);
    const notifications = await PushAPI.user.getFeeds({
      user: addr, // user address in CAIP
      env: "staging",
    });
    console.log("notifications", notifications);
    setNotif(notifications);
  };

  const handleSetOneNotif = (n) => {
    var notify;
    setOneNotif({
      id: oneNotif.id + 1,
      title: n.title,
      message: n.message,
      cta: n.cta,
      app: n.app,
      icon: n.icon,
      image: n.image,
      url: n.url,
      blockchain: n.blockchain,
    });
    console.log("OneNotif", oneNotif, n.title);
  };

  const handleCloseNotification = () => {
    document.getElementById("notifItem").style.display = "none";
  };

    const uploadImageToIPFS = async (imageFile) => {
        const cid = await web3Storage.put([imageFile]);
        console.log(cid);
        return cid;
    };

    const fetchCreatorInfo = async (id) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API}/user/getCreatorInfo?walletAddress=${id}`
            );
            console.log(res.data);
            const memberFind = res.data.members.find(
                (o) => o.memberEmail == state.user.emailId
            );
            if (memberFind) {
                setIsMember(true);
            } else {
                setIsMember(false);
            }
            setCreatorInfo(res.data);
            getMilestoneDetails(res.data.walletAddress);
            getVoteDetails(res.data.walletAddress);
            setAddr(state.user.walletAddress);
            console.log("AAAAAAAAAAAAAAAAAAAAAA", creatorInfo);
        } catch (err) {
            console.log(err);
            setCreatorInfo({});
        }
    };

    const generateNFTImage = async () => {
        const element = document.getElementById("nftcard");
        console.log(element);
        const canvas = await html2canvas(element);

        // var link = document.createElement('a');
        // link.download = 'filename.png';
        // link.href = canvas.toDataURL()
        // link.click();

        const blob = await new Promise((resolve) => canvas.toBlob(resolve));
        var file = new File([blob], "nftImage");
        let url = window.URL.createObjectURL(blob);
        downloadURI(url, "test");
        return file;
    };

    function downloadURI(uri, name) {
        let link = document.createElement("a");
        link.download = name;
        link.href = uri;
        link.click();
    }

    const createPushUser = async (address) => {
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

    const addMemberToPushGroup = async (addressToAdd) => {
        // await createPushUser();

        const provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_URL);
        console.log(process.env.REACT_APP_PVTKEY);
        const wallet = new ethers.Wallet(process.env.REACT_APP_PVTKEY);
        // connect the wallet to the provider
        const signer = wallet.connect(provider);
        const signerAddress = await signer.getAddress();
        console.log(signerAddress);
    
        const user = await PushAPI.user.get({
            account: `eip155:${signerAddress}`,
            env: "staging",
          });

        const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
            encryptedPGPPrivateKey: user.encryptedPrivateKey, 
            signer: signer
        });
        console.log(creatorInfo);
        const response = await PushAPI.chat.getGroupByName({
            groupName: `${creatorInfo.userName} Tribe Group Chat`,
            env: "staging"
        });

        console.log(response);

        let existingMems = response.members;
        let listOfMembers = [];
        existingMems.forEach((item, index) => {
            listOfMembers.push(item.wallet.slice(7));
        });
        if(!listOfMembers.includes(addressToAdd)){
            listOfMembers.push(addressToAdd);
        }
        console.log(listOfMembers);

        const updateRes = await PushAPI.chat.updateGroup({
            chatId: `${response.chatId}`,
            groupName: `${response.groupName}`,
            groupDescription: `${response.groupDescription}`,
            members: listOfMembers,
            groupImage: response.groupImage,
            admins: [creatorInfo.walletAddress, signerAddress],
            account: signerAddress,
            pgpPrivateKey: pgpDecryptedPvtKey, //decrypted private key
            env: "staging"
        });

        console.log(updateRes);
        await approveEntryInGroup(response.chatId);

    }

    const approveEntryInGroup = async (chatId) => {
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
        const signerAddress = await signer.getAddress();
        console.log(signerAddress);
        // await createPushUser();

        const user = await PushAPI.user.get({
            account: `eip155:${signerAddress}`,
            env: "staging",
          });
        // const user = await PushAPI.user.create({
        //     signer: signer,
        //     env: "staging",
        // });

        if(user == null){
            console.log("creating new");
            user = await PushAPI.user.create({
                signer: signer,
                env: "staging",
            });
        }
        console.log(user);
      
        const pgpDecrpyptedPvtKey = await PushAPI.chat.decryptPGPKey({
            encryptedPGPPrivateKey: user.encryptedPrivateKey,
            signer: signer,
        })

        console.log(pgpDecrpyptedPvtKey);

        const approveResponse = await PushAPI.chat.approve({
            status: 'Approved',
            account: signerAddress,
            senderAddress: chatId, // receiver's address or chatId of a group
            signer: signer,
            pgpPrivateKey: pgpDecrpyptedPvtKey, //decrypted private key
            env: "staging"
        });
        console.log(approveResponse);
    }


    const getMilestoneDetails = async (creatorWalletAddress) => {
        try {
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
            console.log(contractInstance);

            let resFromSC;
            resFromSC = await contractInstance.getMilestoneDetails(
                creatorWalletAddress
            );

            setMilestoneInfo({
                milestoneNum: parseInt(resFromSC.milestoneNo.toString()),
                goal: parseInt(resFromSC.goal.toString()) / 1e18,
                fundsRaised: parseInt(resFromSC.fundsRaised.toString()) / 1e18,
            });
        } catch (e) {
            console.log(e);
        }
    };

    const getVoteDetails = async (creatorWalletAddress) => {
        try {
          const magic = new Magic(process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY, {
            network: {
              rpcUrl: process.env.REACT_APP_RPC_URL,
              chainId: 80001,
            },
            extensions: [new OAuthExtension()],
          });

          const rpcProvider = new ethers.providers.Web3Provider(magic.rpcProvider);
      const signer = rpcProvider.getSigner();
      const contractInstance = new ethers.Contract(
        ContractAddress,
        ContractABI,
        signer
      );
      console.log(contractInstance);

      let resFromSC;
      resFromSC = await contractInstance.getVotingStatus(creatorWalletAddress);
      console.log(resFromSC);

      const res = await axios.get(
        `${process.env.REACT_APP_API}/user/getCreatorInfo?walletAddress=${creatorWalletAddress}`
      );
      console.log(res.data);
      const upVoteCount = parseInt(resFromSC[2].toString());
      const downVoteCount = parseInt(resFromSC[3].toString());
      setVotingInfo({
        name: res.data.votingName,
        desc: res.data.votingDesc,
        isLive: resFromSC[0],
        hasVoted: resFromSC[5],
        noOfVotes: parseInt(resFromSC[1].toString()),
        upvoteCount: upVoteCount,
        downvoteCount: downVoteCount,
        percentUp:
          upVoteCount + downVoteCount != 0
            ? (upVoteCount * 100) / (upVoteCount + downVoteCount)
            : 0,
        percentDown:
          upVoteCount + downVoteCount != 0
            ? (downVoteCount * 100) / (upVoteCount + downVoteCount)
            : 0,
        amount: parseInt(resFromSC[4].toString()),
      });
    } catch (e) {
      console.log(e);
    }
  };

  

    const handleBecomeMember = async () => {
        if (!isValid(becomeMemberValue)) {
            toast.error("Enter correct value!");
            return;
        } else if (parseFloat(becomeMemberValue) < 0.1) {
            console.log(parseFloat(becomeMemberValue));
            toast.error("You need to contribute atleast 0.1 MATIC");
            return;
        }
        try {
            setIsBecomeMemberLoading(true);
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
            const contractInstance = new ethers.Contract(
                ContractAddress,
                ContractABI,
                signer
            );
            console.log(contractInstance);

            let resFromSC;
            const options = {
                value: ethers.utils.parseEther(`${becomeMemberValue}`),
            };
            resFromSC = await contractInstance.contribute(
                creatorInfo.walletAddress,
                options
            );


            console.log(resFromSC);
            const res = await axios.post(
                `${process.env.REACT_APP_API}/user/joinMembership`,
                {
                    emailIdCreator: creatorInfo.emailId,
                    emailId: state.user.emailId,
                }
            );
            console.log(res.data);

            // mint NFT for the user

            if(!isMember){
                const nftImage = await generateNFTImage();
                console.log(nftImage);
                const cid = await uploadImageToIPFS(nftImage);
                console.log(cid);
                const tokenUriJson = {
                    image: `https://${cid}.ipfs.w3s.link/nftImage`,
                    external_url: "https://www.communityofcoders.in/",
                    image_preview_url: `https://${cid}.ipfs.w3s.link/nftImage`,
                    name: "Tribe NFT",
                    description: `NFT for ${creatorInfo.name} | ${state.user.walletAddress}`,
                };
                const blob = new Blob([JSON.stringify(tokenUriJson)]);
                var jsonFile = new File([blob], "nftUri");
                const uriCid = await uploadImageToIPFS(jsonFile);
                console.log(uriCid);
    
                const contractInstanceNFT = new ethers.Contract(
                    ContractAddressNFT,
                    ContractABINFT,
                    signer
                );
                console.log(contractInstanceNFT);
    
                let resFromSCNFT = await contractInstanceNFT.userMint(
                    `https://${uriCid}.ipfs.w3s.link/nftUri`
                );
    
                console.log(resFromSCNFT);

                // add to push group

                await addMemberToPushGroup(state.user.walletAddress);

            }

            await subscribe(params.id, addr);
            await getSubs(addr);
            // if (!getSubs(addr)) {
            try {
                // getSubs(addr);
                // console.log("Send Notofication", notif);
                sendNotif(
                "Congrats!",
                `You are a member of the ${creatorInfo.userName} Channel`,
                "Congrats!",
                `You are a member of the ${creatorInfo.userName} Channel`
                );
                setTimeout(async () => {
                const noti = await PushAPI.user.getFeeds({
                    user: addr, // user address in CAIP
                    env: "staging",
                });
                console.log("Notofication sent", noti);
                // handleSetOneNotif(noti[0]);
                console.log("nnnnnnnnnnn", noti[0], oneNotif);

                //   document.getElementById("notifItem").style.display = "block";
                }, 5000);
            } catch (e) {
                toast.error("We ran into an error. Channel can't be opted");
            }
            

            closeBecomeMemberModal();
            fetchCreatorInfo(params.id);
            setIsBecomeMemberLoading(false);
            toast.success("Congrats! You're now a member!");
        } catch (e) {
            console.log(e);
            setIsBecomeMemberLoading(false);
            toast.error(
                "We ran into an error. Make sure you have sufficient funds in your wallet"
            );
        }
    };
      

  useEffect(() => {
    console.log(votingInfo);
  }, [votingInfo]);

  const castVote = async (isTrue) => {
    try {
      setIsVotingLoading(true);
      const magic = new Magic(process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY, {
        network: {
          rpcUrl: process.env.REACT_APP_RPC_URL,
          chainId: 80001,
        },
        extensions: [new OAuthExtension()],
      });

      console.log(magic);

      const rpcProvider = new ethers.providers.Web3Provider(magic.rpcProvider);
      const signer = rpcProvider.getSigner();
      const contractInstance = new ethers.Contract(
        ContractAddress,
        ContractABI,
        signer
      );
      console.log(contractInstance);

      let resFromSC;
      resFromSC = await contractInstance.vote(
        creatorInfo.walletAddress,
        isTrue
      );
      resFromSC = await resFromSC.wait();
      console.log(resFromSC);
      setIsVotingLoading(false);
      toast.success("Your vote is recorded");
      getVoteDetails(creatorInfo.walletAddress);
    } catch (e) {
      console.log(e);
      toast.error("We ran into an error, try again later!");
      setIsVotingLoading(false);
    }
  };

  const fetchPosts = async (emailId, creatorEmailId) => {
    try {
      const postRes = await axios.get(
        `${process.env.REACT_APP_API}/post/getPostsOfCreator`,
        { params: { emailId, creatorEmailId } }
      );
      console.log(postRes.data);
      setPostList(postRes.data);
    } catch (e) {
      console.log(e);
    }
  };

  const navigateToChats = () => {
    navigate(`/chats/${creatorInfo.walletAddress}`);
  };

  const closeCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };

  const openCreateProjectModal = () => {
    setIsCreateProjectModalOpen(true);
  };

  const closeBecomeMemberModal = () => {
    setIsBecomeMemberModalOpen(false);
  };

  const openBecomeMemberModal = () => {
    setIsBecomeMemberModalOpen(true);
  };

  const closeVoteModal = () => {
    setIsVoteModalOpen(false);
  };

  const openVoteModal = () => {
    setIsVoteModalOpen(true);
  };


    return (
        <OuterFrameContainer>
            <Modal
                isOpen={isBecomeMemberModalOpen}
                onRequestClose={closeBecomeMemberModal}
                style={createProjectModalStyles}
            >
                <CreateProjModalContainer>
                    <ModalHeader>Become Member</ModalHeader>
                    <TextViewGroup>
                        <span>Perks & Benefits</span>
                        <TextViewContent>
                            {creatorInfo.benefits}
                        </TextViewContent>
                    </TextViewGroup>
                    {
                        !isMember && <>
                            <TextViewGroup>
                                <span>NFT</span>
                                <TextViewContent >
                                    <NFTTemplateImg id="nftcard" style={{backgroundImage: `url(${creatorInfo.nftTemplate})`}}>
                                        <NFTImageTop></NFTImageTop>
                                        <NFTImageBottom>{nftNameValue}</NFTImageBottom>
                                    </NFTTemplateImg>
                                </TextViewContent>
                            </TextViewGroup>
                            <TextInputGroup>
                                <span>Custom Name on NFT</span>
                                <CustomInput
                                    value={nftNameValue}
                                    onChange={(e) => {
                                        setNftNameValue(e.target.value);
                                    }}
                                    type="text"
                                    placeholder="A cool name!"
                                />
                            </TextInputGroup>
                        </>
                    }
                    <TextInputGroup>
                        <span>Number of Crypts?</span>
                        <CustomInput
                            value={becomeMemberValue}
                            onChange={(e) => {
                                setBecomeMemberValue(e.target.value);
                            }}
                            type="number"
                            name=""
                            id=""
                            placeholder="in MATIC (Minimum 0.1 MATIC)"
                        />
                    </TextInputGroup>
                    <CreateProjModalBottom>
                        <BecomeMemberBtn onClick={handleBecomeMember}>
                            {isBecomeMemberLoading ? (
                                <WhiteLoader label={"Confirming..."} />
                            ) : (
                                "Join"
                            )}
                        </BecomeMemberBtn>
                    </CreateProjModalBottom>
                </CreateProjModalContainer>
            </Modal>
            <Modal
                isOpen={isVoteModalOpen}
                onRequestClose={closeVoteModal}
                style={createProjectModalStyles}
            >
                <CreateProjModalContainer>
                    <ModalHeader>Cast Vote</ModalHeader>
                    <VoteViewContainer>
                        <TextViewGroup>
                            <span>Request Name</span>
                            <TextViewContent>{votingInfo.name}</TextViewContent>
                        </TextViewGroup>
                        <TextViewGroup>
                            <span>Request Description</span>
                            <TextViewContent>{votingInfo.desc}</TextViewContent>
                        </TextViewGroup>
                        {votingInfo.hasVoted && (
                            <VoteBarView>
                                <VoteBarLabel>Yes</VoteBarLabel>
                                <VoteBarContainer>
                                    <VoteBarFilled
                                        percent={votingInfo.percentUp}
                                    ></VoteBarFilled>
                                </VoteBarContainer>
                                <VoteBarLabel>No</VoteBarLabel>
                                <VoteBarContainer>
                                    <VoteBarFilledRed
                                        percent={votingInfo.percentDown}
                                    ></VoteBarFilledRed>
                                </VoteBarContainer>
                            </VoteBarView>
                        )}
                    </VoteViewContainer>
                    {!votingInfo.hasVoted && (
                        <VotingModalActions>
                            {isVotingLoading ? (
                                <WhiteLoader label={"Sending..."} />
                            ) : (
                                <>
                                    <BecomeMemberBtn
                                        onClick={() => {
                                            castVote(true);
                                        }}
                                    >
                                        Vote Yes
                                    </BecomeMemberBtn>
                                    <BecomeMemberBtn
                                        onClick={() => {
                                            castVote(false);
                                        }}
                                    >
                                        Vote No
                                    </BecomeMemberBtn>
                                </>
                            )}
                        </VotingModalActions>
                    )}
                </CreateProjModalContainer>
            </Modal>
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
                <CoverImageContainer>
                    <Navbar />
                    <CoverTopActions></CoverTopActions>
                    <CoverCreatorInfoContainer>
                        <ProfilePicContainer>
                            <ProfilePic src={creatorInfo.profilePic} />
                        </ProfilePicContainer>
                        <InfoContainer>
                            <CoverCreatorName>
                                {creatorInfo.fullName}
                            </CoverCreatorName>
                            <CoverStatsContainer>
                                <CoverStat>
                                    {creatorInfo.members
                                        ? creatorInfo.members.length
                                        : "0"}{" "}
                                    members
                                </CoverStat>
                                {/* <CoverStat>{creatorInfo.walletAddress.substring(0, 7)}..{creatorInfo.walletAddress.slice(-5)}</CoverStat> */}
                            </CoverStatsContainer>
                        </InfoContainer>
                        {milestoneInfo.goal && (
                            <CoverMilestoneStat>
                                <MilestoneMeter>
                                    <FilledMeter
                                        percent={
                                            (milestoneInfo.fundsRaised * 100) /
                                            milestoneInfo.goal
                                        }
                                    ></FilledMeter>
                                    <MilestoneMeterLabel>
                                        {milestoneInfo.fundsRaised} /{" "}
                                        {milestoneInfo.goal}
                                    </MilestoneMeterLabel>
                                </MilestoneMeter>
                                Milestone: {milestoneInfo.milestoneNum}
                            </CoverMilestoneStat>
                        )}
                    </CoverCreatorInfoContainer>
                </CoverImageContainer>
                <FeedContainer>
                    <TopFeedActionsContainer>
                        <BlankSpace></BlankSpace>
                        {/* <button onClick={() => {
                            approveEntryInGroup("7aefb83de11719f2f73253445155c314911f9c49ab8f415f077ddd1f038a51d4");
                        }}>Approve</button> */}
                        {isMember ? (
                            <>
                                <BecomeMemberBtn
                                    onClick={openBecomeMemberModal}
                                >
                                    Send More
                                </BecomeMemberBtn>
                                <FollowBtn onClick={navigateToChats}>
                                    Chat
                                </FollowBtn>
                                {votingInfo.isLive && (
                                    <FollowBtn onClick={openVoteModal}>
                                        Vote
                                    </FollowBtn>
                                )}
                            </>
                        ) : (
                            <BecomeMemberBtn onClick={openBecomeMemberModal}>
                                Become a Member
                            </BecomeMemberBtn>
                        )}
                    </TopFeedActionsContainer>
                    <FeedSection>
                        <SectionHeader>MY STORY</SectionHeader>
                        <StoryText>{creatorInfo.description}</StoryText>
                    </FeedSection>
                    <FeedSection>
                        <SectionHeader>MY WORK</SectionHeader>
                        <WorkListContainer>
                            <a
                                href={creatorInfo.socialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WorkCard>
                                    <img
                                        src={`http://www.google.com/s2/favicons?domain=${creatorInfo.socialUrl}`}
                                        alt=""
                                    />
                                    Website
                                </WorkCard>
                            </a>
                        </WorkListContainer>
                    </FeedSection>
                    {/* <FeedSection>
                        <SectionHeader>
                            <span>PROJECTS</span>
                            {state.user.isCreator && (
                                <SectionHeaderActionBtn
                                    onClick={openCreateProjectModal}
                                >
                                    <Add /> Create Project
                                </SectionHeaderActionBtn>
                            )}
                        </SectionHeader>
                        <WorkListContainer>
                            <ProjectsCard>
                                <img src={music} alt="" />
                                <span>My 9th Single: Untitled</span>
                            </ProjectsCard>
                            <ProjectsCard>
                                <img src={music} alt="" />
                                <span>8th Single: A song</span>
                            </ProjectsCard>
                        </WorkListContainer>
                    </FeedSection> */}
          <FeedSection>
            <SectionHeader>
              <span>POSTS</span>
            </SectionHeader>
            {postList.map((post, index) => {
              return (
                <PostCard id={index} isMemberOnly={post.isMemberOnly}>
                  <PostCredits>
                    <PostCreatorPic src={post.profilePic} />
                    <PostCreatorNameWithDate>
                      <PostCreatorName>{post.fullName}</PostCreatorName>
                      <PostDate>
                        {moment(post.createdAt).format("DD/MM/YYYY, h:mm A")}
                      </PostDate>
                    </PostCreatorNameWithDate>
                  </PostCredits>
                  <PostImage src={post.picUrl} />
                  <PostContent>
                    <PostCaption>{post.caption}</PostCaption>
                  </PostContent>
                </PostCard>
              );
            })}
          </FeedSection>
        </FeedContainer>
      </CreatorPageContainer>
      <NotifItem
        id="notifItem"
        onClick={handleCloseNotification}
        onMouseEnter={handleCloseNotification}
      >
        {oneNotif.id && (
          <NotificationItem
            key={oneNotif.id} // any unique id
            notificationTitle={oneNotif.title}
            notificationBody={oneNotif.message}
            cta={oneNotif.cta}
            app={oneNotif.app}
            icon={oneNotif.icon}
            image={oneNotif.image}
            url={oneNotif.url}
            chainName={oneNotif.blockchain}
            id="noti"
          />
        )}
      </NotifItem>
    </OuterFrameContainer>
  );
};

export default CreatorFeed;
