// Route groups can be created by wrapping a folder in parenthesis: (folder Name)
// Это означает, что папка предназначена для организационных целей и не должна быть включена в URL-адрес маршрута.

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
                        {result.threads.map(thread => (
                            <ThreadCard
                                key={thread._id}
                                id={thread._id}
                                currentUserId={user?.id || ''}
                                parentId={thread.parentId}
                                content={thread.text}
                                author={thread.author}
                                community={thread.community}
                                createdAt={thread.createdAt}
                                comments={thread.children}
                            />
                        ))}
                    </>
                )}
            </section>
        </>
    );
}

export default Home;