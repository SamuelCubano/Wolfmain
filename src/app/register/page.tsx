import RegisterForm from "@/components/auth/RegisterForm";
import AuthRedirect from "@/components/auth/AuthRedirect";

export default function RegisterPage() {
  return (
    <>
      <AuthRedirect />
      <RegisterForm />
    </>
  );
}