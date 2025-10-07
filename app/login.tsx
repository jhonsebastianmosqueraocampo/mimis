import LoginForm from "@/components/LoginForm";
import AuthLayout from "./AuthLayout";

export default function Login() {
  return (
    <AuthLayout
      form={<LoginForm />}
      footerText="¿No tienes una cuenta?"
      footerLinkText="Regístrate aquí"
      footerLinkHref="register"
    />
  );
}