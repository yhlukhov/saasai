'use client'

import { useSuspenseQuery } from "@tanstack/react-query"

import { useTRPC } from "@/trpc/client"

export function AgentsView() {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions())

    const onOpenCh = (open: boolean) => {
        
    }

    return (
        <div>
            {JSON.stringify(data, null, 2)}
        </div>
    )
}