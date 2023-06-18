import { UploadFileOutlined } from "@mui/icons-material";
import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";


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

const CustomDropzone = ({file, setFile}) => {


    const onDrop = useCallback(
        (acceptedFiles) => {
            setFile(acceptedFiles[0]);
        },
        [file]
    );

    
    const {
        acceptedFiles,
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({ onDrop });


    

    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isFocused, isDragAccept, isDragReject]
    );

    return (
        <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <UploadFileOutlined />
            <p>
                {file != null
                    ? `${file.path.substring(
                          0,
                          Math.min(file.path.length, 10)
                      )}...`
                    : "Upload image"}
            </p>
        </div>
    );
};

export default CustomDropzone;