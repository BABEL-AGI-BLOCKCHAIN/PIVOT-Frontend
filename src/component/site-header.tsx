'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useWallet } from "../providers"

export function SiteHeader() {
  const { address, isConnected, connect } = useWallet()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Social Investment</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {!isConnected ? (
            <Button 
              variant="outline" 
              onClick={() => connect()}
            >
              Connect Wallet
            </Button>
          ) : (
            <Button variant="outline">
              {address?.slice(0,6)}...{address?.slice(-4)}
            </Button>
          )}
          <Button asChild>
            <Link href="/publish">Publish Topic</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

