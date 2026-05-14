import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold tracking-normal">Profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Profile updates are designed to be handled through a server action with
        validation before launch.
      </p>
      <form className="mt-6 grid max-w-xl gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input defaultValue={session?.user.name ?? ""} id="name" disabled />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input defaultValue={session?.user.email ?? ""} id="email" disabled />
        </div>
        <Button disabled type="button">
          Profile editing disabled until policy approval
        </Button>
      </form>
    </div>
  );
}
