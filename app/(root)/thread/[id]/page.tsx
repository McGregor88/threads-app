import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";

async function Page({ params }: {params: { id: string }}) {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) {
        redirect('/onboarding');
    }

    const thread = await fetchThreadById(params.id);

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    id={thread._id}
                    currentUserId={user?.id || ''}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    comminity={thread.comminity}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>
        </section>
    );
}

export default Page;