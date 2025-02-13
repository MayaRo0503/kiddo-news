"use client";

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "../components/AdminDashboard";

function AdminPage() {
	const { isAdmin } = useAuth();
	if (!isAdmin) {
		return (
			<div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
				<div className="relative py-3 sm:max-w-xl sm:mx-auto">
					<div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
					<div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
						<div className="max-w-md mx-auto">
							<div className="divide-y divide-gray-200">
								<div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
									<h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-light-blue-500 mb-8">
										Admin Dashboard
									</h1>
									<p>Welcome to the admin dashboard!</p>
									<p>
										This page is protected and only accessible to admin users.
									</p>
								</div>
								<Link
									href="/admin/login"
									className="bg-blue-500 text-white px-4 py-2 rounded-md"
								>
									Login
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return <AdminDashboard />;
}

export default AdminPage;
