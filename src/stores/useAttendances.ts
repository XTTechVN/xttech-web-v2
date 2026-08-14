import {
    useQuery
} from "@tanstack/react-query";

import {
    getAttendances
} from "@/actions";


export const useAttendances = () => {
    return useQuery({
        queryKey: [
            "attendances"
        ],
        queryFn:
            () => getAttendances(),
    });

};