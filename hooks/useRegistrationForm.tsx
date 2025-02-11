import { FieldValues, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "next/navigation";
import { registrationSchema } from "@/schemas/registrationSchema";

export const useRegistrationForm = (role: "admin" | "parent") => {
    const router = useRouter();
    const schema = registrationSchema(role);

    const { formState, handleSubmit, register, control, setError } = useForm({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            ...(role === "parent" && {
                childName: "",
                childBirthDate: "",
                timeLimit: 30,
            }),
        },
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const onSubmit = async (data: FieldValues) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...data, role }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    throw result;
                }
                throw new Error(result.error || 'Registration failed');
            }

            setTimeout(() => {
                router.push(`/${role}/login`);
            }, 3000);
        } catch (error: any) {
            if (error.errors) {
                Object.keys(error.errors).forEach((key) => {
                    setError(key as any, {
                        type: 'server',
                        message: error.errors[key]
                    });
                });
            } else {
                setError('root', {
                    type: 'server',
                    message: error.message || 'Registration failed'
                });
            }
        }
    };

    return { formState, handleSubmit, register, onSubmit, control };
};
