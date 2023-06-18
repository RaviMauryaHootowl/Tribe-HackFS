import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignUpPage from "./pages/SignUp/SignUpPage";
import CreatorFeed from "./pages/CreatorFeed/CreatorFeed";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { StoreProvider } from "./utils/Store";
import WagmiProvider from "./utils/WagmiProvider";
import Redirect from "./pages/Redirect/Redirect";
import Home from "./pages/Home/Home";
import Discover from "./pages/Discover/Discover";
import SignUpCreatorPage from "./pages/SignUp/SignUpCreatorPage";
import RedirectCreator from "./pages/Redirect/RedirectCreator";
import Dashboard from "./pages/Dashboard/Dashboard";
import CryptsPage from "./pages/CryptsPage/CryptsPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import Chats from "./pages/Chats/Chats";
import VideoCall from "./pages/Chats/VideoCall";

const App = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <LandingPage />,
        },
        {
            path: "/home",
            element: <Home />,
        },
        {
            path: "/dashboard",
            element: <Dashboard />,
        },
        {
            path: "/signup",
            element: <SignUpPage />,
        },
        {
            path: "/signupCreator",
            element: <SignUpCreatorPage />,
        },
        {
            path: "/discover",
            element: <Discover />,
        },
        {
            path: "/creator/:id",
            element: <CreatorFeed />,
        },
        {
          path: "/redirect",
          element: <Redirect />
        },
        {
          path: "/redirectCreator",
          element: <RedirectCreator />
        },
        {
          path: "/crypts",
          element: <CryptsPage />
        },
        {
          path: "/chats/:id",
          element: <Chats />
        },
        {
          path: "/videoCall/:id",
          element: <VideoCall />
        },
    ]);

    return (
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
            <StoreProvider>
                <WagmiProvider>
                        <RouterProvider router={router}></RouterProvider>
                </WagmiProvider>
            </StoreProvider>
        </GoogleOAuthProvider>
    );
};

export default App;
