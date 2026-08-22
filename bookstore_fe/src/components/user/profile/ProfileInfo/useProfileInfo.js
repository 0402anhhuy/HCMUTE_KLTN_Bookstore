export const useProfileInfo = ({ setFullName, setPhone }) => {
    const handleFullNameChange = (e) => {
        setFullName?.(e.target.value);
    };

    const handlePhoneChange = (e) => {
        setPhone?.(e.target.value);
    };

    return {
        handleFullNameChange,
        handlePhoneChange,
    };
};
