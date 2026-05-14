import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-normal">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset emails are wired for production email providers. Add an
          email provider in deployment before enabling this form.
        </p>
        <form className="mt-6 grid gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              disabled
              id="email"
              placeholder="student@example.com"
              type="email"
            />
          </div>
          <Button disabled type="submit">
            Email setup required
          </Button>
        </form>
      </div>
    </div>
  );
}
