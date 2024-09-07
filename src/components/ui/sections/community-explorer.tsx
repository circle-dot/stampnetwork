import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CommunityExplorer() {
  const communities = [
    { name: "Crypto Enthusiasts", members: 1234, category: "Crypto", image: "/placeholder.svg", link: "/crypto-enthusiasts" },
    { name: "NFT Collectors", members: 5678, category: "NFT", image: "/placeholder.svg", link: "/nft-collectors" },
    { name: "DeFi Experts", members: 9012, category: "DeFi", image: "/placeholder.svg", link: "/defi-experts" },
    { name: "Blockchain Devs", members: 3456, category: "Tech", image: "/placeholder.svg", link: "/blockchain-devs" },
    { name: "Web3 Gamers", members: 7890, category: "Gaming", image: "/placeholder.svg", link: "/web3-gamers" },
    { name: "DAO Governance", members: 2345, category: "DAO", image: "/placeholder.svg", link: "/dao-governance" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Explore Communities</h1>
          <Button variant="outline">Create Community</Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search communities" className="pl-10" />
            </div>
            <div className="bg-white shadow rounded-lg p-4 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h2>
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {["All", "Crypto", "NFT", "DeFi", "Tech", "Gaming", "DAO"].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="rounded text-primary mr-2" />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
                <div key={community.name} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-4">
                    <Image
                      src={community.image}
                      alt={community.name}
                      width={64}
                      height={64}
                      className="rounded-full mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-lg text-center mb-2">{community.name}</h3>
                    <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                    <Badge variant="secondary" className="block text-center">
                      {community.category}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <Link href={`${community.link}`}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View Details
                    </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-yellow-500">
                      <Star className="w-4 h-4" />
                    </Button>   
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}