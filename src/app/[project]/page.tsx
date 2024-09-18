'use client'

import React, { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Twitter, Globe } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import communityData from "@/data/communityData.json"
import { EnsNameSearch } from "@/components/SearchBar"
import { UserGrid } from '@/components/UserGrid'
import { UserProfileDialog } from "@/components/UserProfileDialog"
import Graph from '@/components/ui/sections/graph'
import { ZuAuthButton } from '@/zupass/ZupassButton';

function getCommunityData(id: string) {
  return communityData[id as keyof typeof communityData] || null
}

export default function ProjectPage({ params }: { params: { project: string } }) {
  const { ready, authenticated, login, user } = usePrivy();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");

  useEffect(() => {
    if (ready) {
      setIsAuthenticated(authenticated);
    }
  }, [ready, authenticated]);

  const community = getCommunityData(params.project)

  if (!community) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar - always visible */}
          <div className="w-full md:w-1/4">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <Image
                    src={community.roles[0].image}
                    alt={community.name}
                    width={80}
                    height={80}
                    className="rounded-full mb-4"
                  />
                  <h2 className="text-2xl font-bold flex items-center">
                    {community.name}
                    <span className="ml-1 text-yellow-400">✦</span>
                  </h2>
                  {/* <p className="text-sm text-gray-500">{community.members} members</p> */}
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-full mb-4">
                      Check your profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {isAuthenticated ? (
                      <UserProfileDialog graphqlEndpoint={community.graphql} />
                    ) : (
                      <>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                          You need to be logged in to view your profile.
                        </DialogDescription>
                        <DialogFooter>
                          <Button onClick={() => { login(); setIsDialogOpen(false); }}>
                            Log In
                          </Button>
                          <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
                
                {isAuthenticated && (
                  <div className="flex justify-center">
<ZuAuthButton community={community} user={user} />
          </div>
                )}
                
                {/* Tab triggers in sidebar */}
                <div className="flex flex-row md:flex-col w-full space-y-0 space-x-2 md:space-y-2 md:space-x-0 mt-4">
                  <Button
                    variant={activeTab === "roles" ? "default" : "outline"}
                    className="flex-1 md:w-full justify-center md:justify-start"
                    onClick={() => setActiveTab("roles")}
                  >
                    Roles
                  </Button>
                  <Button
                    variant={activeTab === "interact" ? "default" : "outline"}
                    className="flex-1 md:w-full justify-center md:justify-start"
                    onClick={() => setActiveTab("interact")}
                  >
                    Interact
                  </Button>
                  <Button
                    variant={activeTab === "graph" ? "default" : "outline"}
                    className="flex-1 md:w-full justify-center md:justify-start"
                    onClick={() => setActiveTab("graph")}
                  >
                    Graph
                  </Button>
                </div>

                <div className="flex justify-center space-x-4 mt-4">
                  {community.links.map((link) => (
                    <a key={link.type} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                      {link.type === "website" ? (
                        <Globe className="h-6 w-6" />
                      ) : (
                        <Twitter className="h-6 w-6" />
                      )}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            {activeTab === "roles" && (
              <div className="space-y-4">
                {community.roles.map((role) => (
                  <Card key={role.name}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Image src={role.image} alt={role.name} width={40} height={40} className="rounded-full" />
                      <div className="flex-grow">
                        <CardTitle>{role.name}</CardTitle>
                        {/* <CardDescription>{role.members} members</CardDescription> */}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Requirements:</h4>
                          <ul className="list-disc pl-5">
                            {role.requirements.map((requirement, index) => (
                              <li key={index} className="text-sm text-muted-foreground">{requirement}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Rewards:</h4>
                          <ul className="list-disc pl-5">
                            {role.rewards.map((reward, index) => (
                              <li key={index} className="text-sm text-muted-foreground">{reward}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {activeTab === "interact" && (
              <div className="space-y-4">
                <EnsNameSearch
                  graphql={community.graphql}
                  platform={community.id}
                />
                <UserGrid communityData={community} />
              </div>
            )}
            {activeTab === "graph" && (
              <Graph graphqlEndpoint={community.graphql} schemaId={community.schema} platform={community.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}