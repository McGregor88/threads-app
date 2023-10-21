"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { sidebarLinks } from "@/constants";

function Bottombar() {
    const pathname = usePathname();

    return (
        <section className="bottombar">
            <div className="bottombar_container">
                {sidebarLinks.map(link => {
                    const route = link.route;
                    const isActive = (pathname.includes(route) && route.length > 1) || pathname === route;

                    return (
                        <Link
                            key={link.label} 
                            href={link.route}
                            className={`bottombar_link ${isActive && 'bg-primary-500'}`}
                        >   
                            <Image
                                src={link.imgURL} 
                                alt={link.label}
                                width={24}
                                height={24}
                            />
                            <p className="text-subtle-medium text-light-1 max-sm:hidden">
                                {link.label.split(/\s+/)[0]}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

export default Bottombar;