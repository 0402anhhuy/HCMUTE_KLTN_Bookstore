export const getProfileFormValues = (user) => ({
    fullName: user?.fullName || "",
    phone: user?.phone ?? "",
    email: user?.email || "",
});
