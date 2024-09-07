import Image from "next/image"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Globe, Twitter } from "lucide-react"

// Mock data for communities
const mockCommunitiesData = {
  base: {
    id: "base",
    name: "Base",
    description: "Base is a secure, low-cost, developer-friendly Ethereum L2 built to bring the next billion users onchain.",
    members: 42069,
    roles: [
      { 
        name: "Base Citizen", 
        members: 41934, 
        image: "/placeholder.svg",
        rewards: ["Access to community forums", "Participation in community votes"]
      },
      { 
        name: "Base OG", 
        members: 135, 
        image: "/placeholder.svg",
        rewards: ["Exclusive NFT", "Priority access to new features", "Direct communication with core team"]
      },
    ],
    links: [
      { type: "website", url: "https://base.org" },
      { type: "twitter", url: "https://twitter.com/BuildOnBase" },
    ],
  },
  // Add more mock communities here if needed
}

function getCommunityData(id: string) {
  return mockCommunitiesData[id as keyof typeof mockCommunitiesData] || null
}

export default function ProjectPage({ params }: { params: { project: string } }) {
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
                src="/placeholder.svg"
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
              <Button className="w-full mb-4">Join Community</Button>
              <Tabs defaultValue="roles">
                <TabsList className="w-full">
                  <TabsTrigger value="roles" className="flex-1">Roles</TabsTrigger>
                  <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
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
                          <h4 className="font-semibold mb-2">Rewards:</h4>
                          <ul className="list-disc pl-5">
                            {role.rewards.map((reward, index) => (
                              <li key={index} className="text-sm text-muted-foreground">{reward}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="requirements">
                  <p>Requirements information would go here.</p>
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