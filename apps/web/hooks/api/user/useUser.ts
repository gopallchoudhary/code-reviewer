import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc/client";

export const useUser = async () => {
    const { data: user, isFetched } = useQuery(trpc.user.getLoggedInUserInfo.queryOptions())
    return {user, isFetched}
};
