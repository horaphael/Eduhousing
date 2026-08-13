import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EduHousing",
  description: "Platform for student-to-student housing handover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
