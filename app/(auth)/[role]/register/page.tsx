"use client";

import { useAuth } from "app/contexts/AuthContext";
import { notFound, useParams } from "next/navigation";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import Link from "next/link";
import { Controller } from "react-hook-form";

export default function ParentAuthPage() {
  const { role } = useParams();

  if (!["admin", "parent"].includes(role as string)) {
    throw notFound();
  }

  useAuth();

  const { formState, register, onSubmit, handleSubmit, control } =
    useRegistrationForm(role as "admin" | "parent");
  const { errors, isSubmitting, isSubmitSuccessful, touchedFields } = formState;
  const isAdmin = role === "admin";

  return (
    // Added "h-screen overflow-y-auto" to ensure the page can scroll if the form is long
    <div className="min-h-screen h-screen overflow-y-auto flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Sign Up
        </h1>
        <p className="text-center text-gray-600 mb-4">
          {!isAdmin &&
            "Sign up to create an account and start managing news for your child."}
          {isAdmin && "Sign up to manage articles"}
        </p>
        {isSubmitSuccessful && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded">
            <p>Registration successful! Redirecting to login...</p>
          </div>
        )}
        {errors.root && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
            <p>{errors.root?.message}</p>
          </div>
        )}

        {!isSubmitSuccessful && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            autoComplete="off"
            noValidate
          >
            <fieldset>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {touchedFields.email && errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                {...register("password", { required: true })}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {touchedFields.password && errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword", { required: true })}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {touchedFields.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <input
                type="text"
                {...register("firstName", { required: true })}
                placeholder="First Name"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {touchedFields.firstName && errors.firstName && (
                <p className="text-red-500 text-xs">
                  {errors.firstName.message}
                </p>
              )}
            </fieldset>
            <fieldset>
              <label htmlFor="lastName" className="sr-only">
                Last Name
              </label>
              <input
                type="text"
                {...register("lastName", { required: true })}
                placeholder="Last Name"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {touchedFields.lastName && errors.lastName && (
                <p className="text-red-500 text-xs">
                  {errors.lastName.message}
                </p>
              )}
            </fieldset>
            {!isAdmin && (
              <fieldset>
                <label htmlFor="childName" className="sr-only">
                  Child&apos;s Name
                </label>
                <input
                  type="text"
                  {...register("childName", { required: true })}
                  placeholder="Child's Name"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {touchedFields.childName && errors.childName && (
                  <p className="text-red-500 text-xs">
                    {errors.childName.message}
                  </p>
                )}
              </fieldset>
            )}
            {!isAdmin && (
              <fieldset>
                <label
                  htmlFor="childBirthDate"
                  className="block text-sm text-gray-600"
                >
                  Child&apos;s Birth Date
                </label>
                <input
                  type="date"
                  id="childBirthDate"
                  {...register("childBirthDate", {
                    valueAsDate: true,
                    required: true,
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  max={new Date().toISOString().split("T")[0]}
                />
                {touchedFields.childBirthDate && errors.childBirthDate && (
                  <p className="text-red-500 text-xs">
                    {errors.childBirthDate.message}
                  </p>
                )}
              </fieldset>
            )}
            {!isAdmin && (
              <Controller
                control={control}
                name="timeLimit"
                render={({ field }) => (
                  <fieldset>
                    <label htmlFor="timeLimit" className="block text-sm">
                      Daily Time Limit (minutes)
                    </label>
                    <input
                      type="range"
                      id="timeLimit"
                      min="10"
                      max="120"
                      step="10"
                      {...field}
                      value={field.value as number}
                      className="w-full"
                    />
                    <p className="text-sm text-center mt-1">
                      {field.value as number} minutes
                    </p>
                    {touchedFields.timeLimit && errors.timeLimit && (
                      <p className="text-red-500 text-xs">
                        {errors.timeLimit.message}
                      </p>
                    )}
                  </fieldset>
                )}
              />
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 text-white rounded-lg ${
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isAdmin && (isSubmitting ? "Creating Admin..." : "Create Admin")}
              {!isAdmin && (isSubmitting ? "Registering..." : "Register")}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-4">
          {isSubmitSuccessful ? "Click here to" : "Already have an account?"}{" "}
          <Link
            href={`/${role}/login`}
            className="text-blue-500 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
