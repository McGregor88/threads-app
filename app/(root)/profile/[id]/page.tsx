import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";
import { profileTabs } from "@/constants";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import DefaultTab from "@/components/shared/DefaultTab";

async function Page(
    { params }: { params: { id: string }}
) {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(params.id);
    if (!userInfo?.onboarded) redirect('/onboarding');

    return (
        <section>
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className="mt-9">
                <Tabs
                    defaultValue="threads"
                    className="w-full"
                >
                    <TabsList className="tab-list">
                        {profileTabs.map(tab => (
                            <TabsTrigger
                                key={tab.label}
                                value={tab.value}
                                className="tab"
                            >
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className="object-contain" 
                                />
                                <p className="max-sm:hidden">
                                    {tab.label}
                                </p>
                                {tab.label === "Threads" && (
                                    <p className="ml-1 px-2 py-1 rounded-sm bg-light-4 !text-tiny-medium text-light-2">
                                        {userInfo?.threads?.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {profileTabs.map(tab => (
                        <TabsContent
                            key={`content-${tab.label}`}
                            value={tab.value}
                            className="w-full text-light-1"
                        >
                            {tab.label === "Threads" ? (
                                <ThreadsTab
                                    currentUserId={user.id} 
                                    accountId={userInfo.id}
                                    accountType="User"
                                />
                            ) : (
                                <DefaultTab name={tab.label} />
                            )}

                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    );
}

export default Page;
