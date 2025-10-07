import RegisterForm from "@/components/RegisterForm";
import AuthLayout from "./AuthLayout";

export default function Register() {
  return (
    <AuthLayout
      form={<RegisterForm />}
      footerText="¿Ya tienes una cuenta?"
      footerLinkText="Inicia sesión"
      footerLinkHref="login"
    />
  );
}