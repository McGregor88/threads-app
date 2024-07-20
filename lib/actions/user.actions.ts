"use server";

import { revalidatePath } from "next/cache";
import { SortOrder, FilterQuery } from "mongoose";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path  
}: Params): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true
            },
            { upsert: true },
        );
    
        if (path === '/profile/edit') {
            revalidatePath(path);
        }  
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId: string) {
    connectToDB();

    try {
        return await User
            .findOne({ id: userId })
            .populate({
                path: 'communities',
                model: Community
            });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

export async function fetchUsers ({
    userId,
    searchString = '',
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc',
}: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    connectToDB();

    try {
        // Calculate the number of users to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;
        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, 'i');
        // Create an initial query object to filter users.
        const query: FilterQuery<typeof User> = {
            id : { $ne: userId }
        };

        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched users based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };
        const usersQuery = User
            .find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);
        // Count the total number of users that match the search criteria (without pagination).
        const totalUsersCount = await User.countDocuments(query);
        const users = await usersQuery.exec();
        // Check if there are more users beyond the current page.
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function fetchUserThreads(userId: string) {
    connectToDB();

    try {
        // Find all threads authored by user with the given userId
        const threads = await User.findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: [
                    {
                        path: 'community',
                        model: Community,
                        // Select the "name" and "_id" fields from the "Community" model
                        select: "name id image _id", 
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                          path: 'author',
                          model: User,
                          // Select the "name" and "_id" fields from the "User" model
                          select: "name image id", 
                        },
                    },
                ],
            });

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch user threads: ${error.message}`);
    }
}

export async function fetchActivities(userId: string) {
    connectToDB();

    try {
        // Find all threads created by the user
        const userThreads = await Thread.find({ 
            author: userId
        });
        // Collect all the child thread ids (replies) from the 'children' field
        const childThreadsIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        // Find and return the child threads (replies) excluding the ones created by the same user
        const replies = await Thread
            .find({
                _id: { $in: childThreadsIds },
                // Exclude threads authored by the same user
                author: { $ne: userId }
            })
            .populate({
                path: 'author',
                model: User,
                select: 'name image _id'
            });
        
        return replies;
    } catch (error: any) {
        throw new Error(`Failed to fetch activities: ${error.message}`);
    }
}