import { type FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useAuth } from "app/contexts/AuthContext";
import yup from "@/lib/yupExtensions";

export const useLoginForm = (role: "admin" | "parent") => {
	const router = useRouter();
	const schema = yup.object().shape({
		email: yup.string().customEmail().required("An email is required"),
		password: yup.string().customPassword().required("A password is required"),
	});
	const { login } = useAuth();

	const { formState, handleSubmit, register, setError } = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		resolver: yupResolver(schema),
		mode: "onSubmit",
	});

	const onSubmit = async (data: FieldValues) => {
		try {
			const response = await fetch(
				`/api/auth/${role === "admin" ? "admin/login" : "login"}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			const result = await response.json();

			if (!response.ok) {
				if (result.errors) {
					throw result;
				}
				throw new Error(result.error || "Login failed");
			}

			login(result.token, role === "parent", result.user?.child?.timeLimit);

			setTimeout(
				() => router.push(role === "admin" ? "/admin" : "/parent/profile"),
				3000,
			);
		} catch (error: any) {
			if (error.errors) {
				Object.keys(error.errors).forEach((key) => {
					setError(key as any, {
						type: "server",
						message: error.errors[key],
					});
				});
			} else {
				setError("root", {
					type: "server",
					message: error.message || "Login failed",
				});
			}
		}
	};

	return { formState, handleSubmit, register, onSubmit };
};
