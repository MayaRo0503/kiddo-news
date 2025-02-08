"use client";

import { useState } from "react";
import { useAuth } from "app/contexts/AuthContext";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ParentAuthPage() {
	const { role } = useParams();
	if (!["admin", "parent"].includes(role as string)) {
		throw notFound();
	}
	useAuth();
	const router = useRouter();
	const [isLogin] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
		childName: "",
		childBirthDate: "", // Add birth date field
		timeLimit: 30,
	});

	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value.trim() }));
		setError("");
	};

	const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, timeLimit: Number(e.target.value) }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		if (!isLogin && formData.password !== formData.confirmPassword) {
			setError("Passwords do not match!");
			setLoading(false);
			return;
		}

		// Validate birth date
		const birthDate = new Date(formData.childBirthDate);
		if (Number.isNaN(birthDate.getTime())) {
			setError("Please enter a valid birth date");
			setLoading(false);
			return;
		}

		const today = new Date();
		let calculatedAge = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			calculatedAge--;
		}

		if (calculatedAge < 5 || calculatedAge > 17) {
			setError("Child must be between 5 and 17 years old");
			setLoading(false);
			return;
		}

		const endpoint = "/api/auth/register";

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "An error occurred. Please try again.");
				setLoading(false);
				return;
			}

			setSuccess(true);

			setTimeout(() => {
				router.push("/auth/login");
			}, 3000);
		} catch (error) {
			console.error("Error:", error);
			setError("Something went wrong. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const isAdmin = role === "admin";

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
			<div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
				<h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
					Sign Up
				</h1>
				<p className="text-center text-gray-600 mb-4">
					{!isAdmin &&
						"Sign up to create an account and start managing news for your child."}
					{isAdmin && "Sign up to manage articles"}
				</p>

				{error && (
					<div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
						<p>{error}</p>
					</div>
				)}

				{success && (
					<div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
						<p>
							Registration successful! Please verify your email to activate your
							account. Redirecting to login...
						</p>
					</div>
				)}

				{!success && (
					<form
						onSubmit={handleSubmit}
						className="space-y-4"
						autoComplete="off"
					>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Email"
							required
							className="w-full px-4 py-2 border rounded-lg"
						/>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Password"
							required
							className="w-full px-4 py-2 border rounded-lg"
						/>
						<input
							type="password"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Confirm Password"
							required
							className="w-full px-4 py-2 border rounded-lg"
						/>
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							placeholder="First Name"
							required
							className="w-full px-4 py-2 border rounded-lg"
						/>
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							placeholder="Last Name"
							required
							className="w-full px-4 py-2 border rounded-lg"
						/>
						{!isAdmin && (
							<input
								type="text"
								name="childName"
								value={formData.childName}
								onChange={handleChange}
								placeholder="Child's Name"
								required
								className="w-full px-4 py-2 border rounded-lg"
							/>
						)}
						{!isAdmin && (
							<div className="space-y-2">
								<label
									htmlFor="childBirthDate"
									className="block text-sm text-gray-600"
								>
									Child&apos;s Birth Date
								</label>
								<input
									type="date"
									id="childBirthDate"
									name="childBirthDate"
									value={formData.childBirthDate}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border rounded-lg"
									max={new Date().toISOString().split("T")[0]} // Prevent future dates
								/>
							</div>
						)}
						{!isAdmin && (
							<div>
								<label htmlFor="timeLimit" className="block text-sm">
									Daily Time Limit (minutes)
								</label>
								<input
									type="range"
									id="timeLimit"
									name="timeLimit"
									min="10"
									max="120"
									step="10"
									value={formData.timeLimit}
									onChange={handleSliderChange}
									className="w-full"
								/>
								<p className="text-sm text-center mt-1">
									{formData.timeLimit} minutes
								</p>
							</div>
						)}
						<button
							type="submit"
							disabled={loading}
							className={`w-full px-4 py-2 text-white rounded-lg ${
								loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
							}`}
						>
							{loading ? "Registering..." : "Register"}
						</button>
					</form>
				)}

				<p className="text-center text-sm mt-4">
					Already have an account?{" "}
					<Link
						href={`/auth/${role}`}
						className="text-blue-500 hover:underline"
					>
						Log In
					</Link>
				</p>
			</div>
		</div>
	);
}
