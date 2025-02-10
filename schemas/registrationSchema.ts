import yup from "../lib/yupExtensions";

export const registrationSchema = (role: "admin" | "parent") => yup.object().shape({
    email: yup.string().customEmail().required("An email is required"),
    password: yup.string().customPassword().required("A password is required"),
    confirmPassword: yup.string().required("Confirm password is required").oneOf([yup.ref("password"), null as never], "Passwords must match"),
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    ...(role === "parent" && {
        childName: yup.string().required("Child name is required"),
        childBirthDate: yup.date().customChildBirthDate().required("Child birth date is required"),
        timeLimit: yup.number().customTimeLimit().required("Time limit is required"),
    }),
});