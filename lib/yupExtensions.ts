import * as yup from "yup";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

yup.addMethod(yup.string, "customEmail", function () {
    return this.test("email", "Please enter a valid email", (value) => {
        return value ? emailRegex.test(value) : false;
    });
});

yup.addMethod(yup.number, "customTimeLimit", function () {
    return this.typeError("Please enter a valid time limit").test("timeLimit", "Time limit must be between 10 and 120", (value) => {
        return value ? value >= 10 && value <= 120 : false;
    });
});

yup.addMethod(yup.date, "customChildBirthDate", function () {
    return this.typeError("Please enter a valid date").test("childBirthDate", "Child must be between 5 and 17 years old", (value) => {
        const now = new Date();
        const [year, month, date] = [now.getFullYear(), now.getMonth(), now.getDate()];
        const min = new Date(year - 17, month, date);
        const max = new Date(year - 5, month, date);
        return value ? value >= min && value <= max : false;
    });
});

yup.addMethod(yup.string, "customPassword", function () {
    return this.test("password", "Password must be at least 8 characters long, include letters and numbers", (value) => {
        return value ? value.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) : false;
    });
});

export default yup;