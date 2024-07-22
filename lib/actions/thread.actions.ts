// Чтобы вызвать серверное действие в клиентском компоненте
// нужно добавить директиву "use server" 
// Все функции в файле будут помечены как серверные действия, 
// которые могут быть повторно использованы как в клиентском, так и в серверном компонентах
"use server"; 

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";

interface Params {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}

export async function createThread({
    text,
    author,
    communityId,
    path
}: Params) {
    connectToDB();

    try {
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );

        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
        });
    
        // Update user model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });

        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }
    
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }
};

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    connectToDB();

    try {
        // Calculate the number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;

        const threadsQuery = Thread
            .find({
                parentId: { $in: [null, undefined] }
            })
            .sort({
                createdAt: 'desc'
            })
            .skip(skipAmount)
            .limit(pageSize)
            // заполнить
            .populate({
                path: 'author',
                model: User
            })
            .populate({
                path: 'community',
                model: Community,
            })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: User,
                    select: '_id name parentId image'
                }
            });

        const totalThreadsCount = await Thread.countDocuments({
            parentId: { $in: [null, undefined] }
        });

        const threads = await threadsQuery.exec();
        const isNext = totalThreadsCount > skipAmount + threads.length;

        return {
            threads,
            isNext
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch threads: ${error.message}`);
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });
    const descendantThreads = [];

    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }
  
    return descendantThreads;
}

export async function fetchThreadById(id: string) {
    connectToDB();

    try {
        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User,
                select: '_id id name image'
            })
            .populate({
                path: 'community',
                model: Community,
                select: '_id id name image',
            }) // Populate the community field with _id and name
            .populate({
                path: 'children',
                populate: [{
                    path: 'author',
                    model: User,
                    select: '_id id name parentId image'
                }, {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    }
                }]
            })
            .exec();

        return thread;
    } catch (error: any) {
        throw new Error(`Failed to fetch thread: ${error.message}`);
    }
}

export async function deleteThread(
    id: string, 
    path: string
): Promise<void> {
    connectToDB();

    try {
        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate('author community');
  
        if (!mainThread) {
            throw new Error('Thread not found');
        }
  
        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);
  
        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map(thread => thread._id),
        ];
  
        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                // Use optional chaining to handle possible undefined values
                ...descendantThreads.map(thread => thread.author?._id?.toString()), 
                mainThread.author?._id?.toString(),
            ].filter(id => id !== undefined)
        );
  
        const uniqueCommunityIds = new Set(
            [
                // Use optional chaining to handle possible undefined values
                ...descendantThreads.map(thread => thread.community?._id?.toString()), 
                mainThread.community?._id?.toString(),
            ].filter(id => id !== undefined)
        );
  
        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: {$in: descendantThreadIds } });
  
        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );
  
        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );
  
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    connectToDB();

    try {
        // Find the original thread by its id
        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error('Thread not found');
        }

        // Create a new thread with comment text
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        });
        // Save the new thread
        const savedCommentThread = await commentThread.save();

        // Update the original thread to include the new comment
        originalThread.children.push(savedCommentThread._id);
        // Save the original thread
        await originalThread.save();
        revalidatePath(path); 
    } catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`);
    }
}
