import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
// Internal imports
import { auth } from "@/lib/auth"
import { trpc, getQueryClient } from "@/trpc/server"
import { UpgradeView, UpgradeViewError, UpgradeViewLoading } from "@/modules/premium/ua/views/upgrade-view"

export default async function UpgradePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if(!session) {
    redirect('/sign-in')
  }
  const queryClient = getQueryClient()
  void queryClient.query(trpc.premium.getCurrentSubscription.queryOptions())
  void queryClient.query(trpc.premium.getProducts.queryOptions())

  return(
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<UpgradeViewLoading />}>
        <ErrorBoundary fallback={<UpgradeViewError />}>
          <UpgradeView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  )
}