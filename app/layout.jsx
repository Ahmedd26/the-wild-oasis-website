import { Josefin_Sans } from "next/font/google";
import { ReservationProvider } from "./_components/ReservationContext";
const josefin_sans = Josefin_Sans({
    subsets: ["latin"],
    display: "swap",
});

import "./_styles/globals.css";
import Header from "./_components/Header";

export const metadata = {
    title: {
        template: "%s | The Wild Oasis",
        default: "Welcome | The Wild Oasis",
    },
    description:
        "Luxurious cabin hotel, located in the heart of the Italian Dolomites, surrounded by beautiful mountains and dark forests",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${josefin_sans.className} relative bg-primary-950 text-primary-100 min-h-dvh flex flex-col antialiased`}
            >
                <Header />
                <div className="flex-1 px-8 py-12 grid">
                    <main className="max-w-7xl mx-auto w-full">
                        <ReservationProvider>{children}</ReservationProvider>
                    </main>
                </div>
            </body>
        </html>
    );
}
