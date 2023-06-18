import { toast } from 'react-toastify';
import { Slide, Zoom, Flip, Bounce } from 'react-toastify';

const notify = (message, type) => {
    toast(message, {
        position: "bottom-right",
        type: type ? type : "default",
    });
}

export const notifyPromise = (message) => {
    const id = toast.loading(message, {
        position: "bottom-right",
    });
    return id;
}

export const notifyResolve = (id, message, type) => {
    toast.update(id, {
        render: message,
        type: type,
        position: "bottom-right",
        isLoading: false,
        autoClose: 2000,
        closeButton: true,
        transition: Flip,
    });
}

export default notify;
