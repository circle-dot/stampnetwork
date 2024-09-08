"use client"
import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from "next/image"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Globe, Twitter } from "lucide-react"
import communityData from "@/data/communityData.json"
import { EnsNameSearch } from "@/components/SearchBar"
import { UserGrid } from '@/components/UserGrid'
import { UserProfileDialog } from "@/components/UserProfileDialog"

function getCommunityData(id: string) {
  return communityData[id as keyof typeof communityData] || null
}

export default function ProjectPage({ params }: { params: { project: string } }) {
  const { ready, authenticated, login } = usePrivy();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsAuthenticated(authenticated);
    }
  }, [ready, authenticated]);

  const communityData = getCommunityData(params.project)

  if (!communityData) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center gap-4">
              <Image
                src={communityData.roles[0].image}
                alt={communityData.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{communityData.name}</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {communityData.members} members
                  </Badge>
                </div>
                <CardDescription>{communityData.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mb-4">Check your profile</Button>
                </DialogTrigger>
                <DialogContent>
                  {isAuthenticated ? (
                    <UserProfileDialog graphqlEndpoint={communityData.graphql} />
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
              <Tabs defaultValue="roles">
                <TabsList className="w-full">
                  <TabsTrigger value="roles" className="flex-1">Roles</TabsTrigger>
                  <TabsTrigger value="interact" className="flex-1">Interact</TabsTrigger>
                </TabsList>
                <TabsContent value="roles">
                  <div className="grid gap-4">
                    {communityData.roles.map((role) => (
                      <Card key={role.name}>
                        <CardHeader className="flex flex-row items-center gap-4">
                          <Image src={role.image} alt={role.name} width={40} height={40} className="rounded-full" />
                          <div className="flex-grow">
                            <CardTitle>{role.name}</CardTitle>
                            <CardDescription>{role.members} members</CardDescription>
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
                </TabsContent>
                <TabsContent value="interact">
                  <div className="space-y-4">
                    <EnsNameSearch 
                      graphql={communityData.graphql}
                      schema={communityData.schema}
                      chain={communityData.chainId.toString()}
                      platform={communityData.id}
                      verifyingContract={communityData.verifyingContract}
                    />
                    <UserGrid communityData={communityData} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Community Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>{communityData.members} members</span>
              </div>
              {communityData.links.map((link) => (
                <div key={link.type} className="flex items-center gap-2">
                  {link.type === "website" ? (
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Twitter className="h-5 w-5 text-muted-foreground" />
                  )}
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {link.url}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}