import { createContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

export const StoreContext = createContext();

const customNodeOptions = {
    rpcUrl: 'https://polygon-rpc.com/', // Polygon RPC URL
    chainId: 137, // Polygon chain id
};

const initialState = {
    user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : {},
    jwt: Cookies.get('jwt') || '',
    cart: [],
    addressID: Cookies.get('addressID') || '',
    magic: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_USER':
            console.log('Setting User', action.payload);
            return {
                ...state,
                user: action.payload,
            };
        case 'UNSET_USER':
            console.log('Removing User');
            return {
                ...state,
                user: null,
            };
        case 'SET_JWT':
            return {
                ...state,
                jwt: action.payload,
            };
        case 'UNSET_JWT':
            return {
                ...state,
                jwt: '',
            };
        case 'ADD_TO_CART':
            console.log("Setting cart", action.payload)
            return {
                ...state,
                // Only add one product at a time
                cart: [action.payload],
                // cart: [...state.cart, action.payload],
            };
        case 'EMPTY_CART':
            return {
                ...state,
                cart: [],
            };
        case 'SET_ADDRESS_ID':
            return {
                ...state,
                addressID: action.payload,
            };
        case 'UNSET_ADDRESS_ID':
            return {
                ...state,
                addressID: '',
            };
        case 'SET_MAGIC':
            console.log('setting magic')
            return {
                ...state,
                magic: action.payload,
            };
        case 'UNSET_MAGIC':
            return {
                ...state,
                magic: null,
            };
        default:
            return state;
    }
}

export const StoreProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    //   // Access localStorage
    //   console.log('CART', localStorage.getItem('cart'));
    //   dispatch({
    //         type: "ADD_TO_CART",
    //         payload: localStorage.getItem('cart'),
    //       })
    // }
    // useEffect(() => {
    //   const ISSERVER = typeof window === 'undefined';

    //   if (!ISSERVER) {
    //     console.log("CART ->",JSON.parse(localStorage.getItem('cart'))[0])
    //     dispatch({
    //       type: 'ADD_TO_CART',
    //       payload: JSON.parse(localStorage.getItem('cart'))[0],
    //     });
    //   }
    // }, []);

    useEffect(() => {
        const magic = new Magic(process.env.REACT_APP_MAGICLINK_PUBLISHABLE_KEY, {
            // testMode: true,
            network: customNodeOptions,
            extensions: [new OAuthExtension()]
        })
        dispatch({
            type: 'SET_MAGIC',
            payload: magic,
        })
        // console.log(magic)
    }, []);

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
};
