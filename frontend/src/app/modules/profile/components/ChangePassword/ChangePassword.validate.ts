
export const rules = {
    old_password: [
        { required: true, message: "Please enter your old password" },
    ],
    new_password: [
        { required: true, message: "Please enter your new password" },
        { min: 6, message: "Please enter at least 6 characters" }
    ],
};