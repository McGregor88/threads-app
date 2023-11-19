import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import UserCard from "@/components/cards/UserCard";

async function Page() {
    const user = await currentUser();
    if (!user) return null;

    const userId = user.id;
    const userInfo = await fetchUser(userId);
    if (!userInfo?.onboarded) redirect('/onboarding');

    // Fetch users
    const result = await fetchUsers({
        userId,
        searchString: '',
        pageNumber: 1,
        pageSize: 25,
    });
    const users = result.users;

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>

            {/* Search bar */}

            <div className="mt-14 flex flex-col gap-9">
                {users.length === 0 ? (
                    <p className="no-result">
                        No users
                    </p>
                ) : (
                    <>
                        {users.map(person => (
                            <UserCard
                                key={person.id}
                                id={person.id}
                                name={person.name}
                                username={person.username}
                                imgUrl={person.image}
                                personType="User"
                            />
                        ))}
                    </>
                )}
            </div>
        </section>
    );
}

export default Page;