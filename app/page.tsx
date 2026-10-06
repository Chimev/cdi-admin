import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/auth";

export default async function Page() {
  // Pass your authOptions to getServerSession to get the session on the server
  const session = await getServerSession(authOptions);

  // If the user has a valid session, send them to the admin panel
  if (session) {
    redirect("/admin");
  }

  // If they are not logged in, send them to the login page
  redirect("/login");
}
