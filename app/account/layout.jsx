import Link from "next/link";
import SideNavigation from "../_components/SideNavigation";

export default function layout({ children }) {
    return (
        <div className="grid grid-cols-[16rem_1fr] h-full gap-12">
            <SideNavigation />
            <section className="py-1">{children}</section>
        </div>
    );
}
