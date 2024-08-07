import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
        id: string;
        name: string;
        image: string;
    };
    community: {
        id: string;
        name: string;
        image: string;
    } | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
        };
    }[];
    isComment?: boolean;
}

function ThreadCard({
    id,
    currentUserId,
    parentId,
    content,
    author,
    community,
    createdAt,
    comments,
    isComment
}: Props) {
    return (
        <article 
            className={`w-full flex flex-col rounded-xl ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'}`}
        >
            <div className="flex items-start justify-between">
                <div className="w-full flex flex-1 flex-grow gap-4">
                    <div className="flex flex-col items-center">
                        <Link
                            href={`/profile/${author.id}`}
                            className="relative h-11 w-11"
                        >
                            <Image
                                src={author.image}
                                alt={author.name}
                                className="cursor-pointer rounded-full"
                                fill
                            />
                        </Link>
                        <div className="thread-card_bar" />
                    </div>

                    <div className="w-full flex flex-col">
                        <Link
                            href={`/profile/${author.id}`}
                            className="w-fit"
                        >
                            <h4 className="cursor-pointer text-base-semibold text-light-1">
                                {author.name}
                            </h4>
                        </Link>

                        <p className="mt-2 text-small-regular text-light-2">
                            {content}
                        </p>

                        <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
                            <div className="flex gap-3.5">
                                {/* TODO: Сделать лайки */}
                                <Image
                                    src="/assets/heart-gray.svg"
                                    alt="heart"
                                    width={24}
                                    height={24}
                                    className="cursor-default object-contain"
                                />
                                <Link 
                                    href={`/thread/${id}`} 
                                    className="flex items-center"
                                >
                                    <Image
                                        src="/assets/reply.svg"
                                        alt="reply"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                    <span className="text-small-regular text-light-2">
                                        {comments?.length ? comments.length : ''}
                                    </span>
                                </Link>
                                {/* TODO: Сделать репосты */}
                                <Image
                                    src="/assets/repost.svg"
                                    alt="repost"
                                    width={24}
                                    height={24}
                                    className="cursor-default object-contain"
                                />
                                {/* TODO: Доделать */}
                                <Image
                                    src="/assets/share.svg"
                                    alt="share"
                                    width={24}
                                    height={24}
                                    className="cursor-default object-contain"
                                />
                            </div>
                            {isComment && comments?.length && (
                                <Link href={`/thread/${id}`}>
                                    <p className="mt-1 text-subtle-medium text-gray-1">
                                        {comments.length} replies
                                    </p>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                {/* TODO: DeleteThread */}
                {/* TODO: Show comment logs */}
            </div>
            {!isComment && community && (
                <Link 
                    href={`/communities/${community.id}`}
                    className="mt-5 flex items-center"
                >
                    <p className="text-subtle-medium text-gray-1">
                        {formatDateString(createdAt)}
                        {" "} - {community.name} Community
                    </p>

                    <Image 
                        src={community.image}
                        alt={community.name}
                        width={14}
                        height={14}
                        className="ml-1 rounded-full object-cover"
                    />
                </Link>
            )}
        </article>
    );
}

export default ThreadCard;
