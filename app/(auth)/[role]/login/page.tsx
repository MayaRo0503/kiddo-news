"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useAuth } from "app/contexts/AuthContext";
import Link from "next/link";
import { useLoginForm } from "@/hooks/useLoginForm";
import { useEffect } from "react";

export default function LoginPage() {
	const { role } = useParams();
	if (!["admin", "parent"].includes(role as string)) {
		throw notFound();
	}

	const { formState, register, onSubmit, handleSubmit } = useLoginForm(
		role as "admin" | "parent",
	);
	const { errors, isSubmitting, isSubmitSuccessful, touchedFields } = formState;

	const { isLoggedIn, isAdmin } = useAuth();
	const router = useRouter();
	useEffect(() => {
		if (isLoggedIn && !isSubmitSuccessful) {
			router.push(isAdmin ? "/admin" : "/articles");
		}
	}, [isLoggedIn, router, isAdmin, isSubmitSuccessful]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<h1 className="text-3xl font-bold text-center text-purple-800 mb-8">
						<span className="capitalize">{role}</span> Login
					</h1>
					{errors.root && (
						<div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
							<p>{errors.root?.message}</p>
						</div>
					)}
					{isSubmitSuccessful && (
						<div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
							<p>Login successful! Redirecting...</p>
						</div>
					)}
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
						autoComplete="on"
					>
						<fieldset>
							<label htmlFor="email" className="sr-only">
								Email
							</label>
							<input
								type="email"
								{...register("email")}
								placeholder="Email"
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
							{touchedFields.email && errors.email && (
								<p className="text-red-500 text-xs mt-1">
									{errors.email.message}
								</p>
							)}
						</fieldset>
						<fieldset>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								type="password"
								{...register("password")}
								placeholder="Password"
								className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
							{touchedFields.password && errors.password && (
								<p className="text-red-500 text-xs mt-1">
									{errors.password.message}
								</p>
							)}
						</fieldset>
						<button
							type="submit"
							disabled={isSubmitting}
							className={`w-full bg-purple-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-purple-700 transition-colors duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							{isSubmitting ? "Logging in..." : "Login"}
						</button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-gray-600">
							Don&apos;t have an account?{" "}
							<Link
								href={`/${role}/register`}
								className="text-purple-600 hover:underline"
							>
								Register
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
