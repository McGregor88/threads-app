import { currentUser } from "@clerk/nextjs";

import { fetchThreads } from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";

async function Home() {
    const result = await fetchThreads(1, 30);
    const user = await currentUser();

    return (
        <>
            <h1 className="head-text text-left">Home</h1>
            <section className="mt-9 flex flex-col gap-10">
                {result.threads.length === 0 ? (
                    <p className="no-result">
                        No threads found
                    </p>
                ) : (
                    <>
                        {result.threads.map(item => (
                            <ThreadCard
                                key={item._id}
                                id={item._id}
                                currentUserId={user?.id || ''}
                                parentId={item.parentId}
                                content={item.text}
                                author={item.author}
                                comminity={item.comminity}
                                createdAt={item.createdAt}
                                comments={item.children}
                            />
                        ))}
                    </>
                )}
            </section>
        </>
    );
}

export default Home;