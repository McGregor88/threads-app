import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";

import CommunityCard from "@/components/cards/CommunityCard";

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userId = user.id;
    const userInfo = await fetchUser(userId);
    if (!userInfo?.onboarded) redirect('/onboarding');

    // Fetch communities
    const result = await fetchCommunities({
        searchString: '',
        pageNumber: 1,
        pageSize: 25
    });
    const communities = result.communities;

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>

            {/* TODO: Search bar */}

            <div className="mt-14 flex flex-col gap-9">
                {communities.length === 0 ? (
                    <p className="no-result">
                        No communities
                    </p>
                ) : (
                    <>
                        {communities.map(community => (
                            <CommunityCard 
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                username={community.username}
                                imgUrl={community.image}
                                bio={community.bio}
                                members={community.members}
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    );
}

export default Page;