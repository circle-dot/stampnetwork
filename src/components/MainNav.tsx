'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LogOut, Twitter, Hash } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { siteName } from '../../config/siteConfig'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Navbar() {
  const { ready, authenticated, login, user, logout, linkFarcaster, linkTwitter } = usePrivy()
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const sections = [
    { name: "Explore", href: "/explore" },
    { name: "Create", href: "/create" },
    { name: "Learn", href: "/learn" },
  ]

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleLinkTwitter = () => {
    if (ready) {
      linkTwitter()
    }
  }

  const handleLinkFarcaster = () => {
    if (ready) {
      linkFarcaster()
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-background text-foreground shadow-sm">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-primary">
          {siteName}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden md:flex border-secondary text-secondary">
               <Menu className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card text-card-foreground">
            {sections.map((section) => (
              <DropdownMenuItem key={section.name} className="hover:bg-muted">
                <Link href={section.href}>{section.name}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-4">
        {ready && authenticated && user ? (
          <>
            <Button 
              variant="outline" 
              className="border-secondary text-secondary"
              onClick={() => setIsDialogOpen(true)}
            >
              {user.wallet ? truncateAddress(user.wallet.address) : 'No wallet connected'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="bg-card text-card-foreground">
                <DialogHeader>
                  <DialogTitle className="text-primary">Your Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 bg-muted rounded-lg">
                    <span>{user.wallet ? truncateAddress(user.wallet.address) : 'No wallet connected'}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={logout}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                  {user?.twitter?.username ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <a 
                        href={`https://x.com/${user.twitter.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        @{user.twitter.username}
                      </a>
             {/*          <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {console.log('disconnect twitter')}}
                        className="text-secondary hover:text-secondary/90"
                      >
                        Disconnect
                      </Button> */}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleLinkTwitter}
                      disabled={!ready}
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Connect Twitter
                    </Button>
                  )}
                  
                  {user?.farcaster?.username ? (
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <a 
                        href={`https://warpcast.com/${user.farcaster.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline flex items-center"
                      >
                        <Hash className="w-4 h-4 mr-2" />
                        @{user.farcaster.username}
                      </a>
               {/*        <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {console.log('disconnect farcaster')}}
                        className="text-secondary hover:text-secondary/90"
                      >
                        Disconnect
                      </Button> */}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleLinkFarcaster}
                      disabled={!ready}
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      Connect Farcaster
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Button onClick={login} disabled={!ready || (ready && authenticated)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign In
          </Button>
        )}
        <Button variant="outline" className="md:hidden border-secondary text-secondary" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card text-card-foreground shadow-md md:hidden">
          {sections.map((section) => (
            <Link
              key={section.name}
              href={section.href}
              className="block px-4 py-2 text-sm hover:bg-muted"
              onClick={() => setIsOpen(false)}
            >
              {section.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}