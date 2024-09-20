'use client'

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Image from "next/image"
import communityData from '@/data/communityData.json'
import Link from 'next/link'

export default function CommunityExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const communities = useMemo(() => Object.values(communityData), [])
  const categories = useMemo(() => 
    ['All', ...Array.from(new Set(communities.map(c => c.category)))],
    [communities]
  )

  const filteredCommunities = useMemo(() => {
    return communities.filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [communities, searchTerm, selectedCategory])

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <div className="relative shadow-sm max-w-lg border bg-background border-secondary rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary " />
              </div>
              <Input
                type="text"
                className="pl-10 block w-full bg-background border border-secondary rounded-xl focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-background border-secondary block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-xl"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {/* <span className="text-gray-500">{filteredCommunities.length} space(s)</span> */}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCommunities.map((community) => (
  <Link href={`/${community.id}`} key={community.id} className="block rounded-xl">
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
      <Image
        src={community.roles[0].image}
        alt={community.name}
        width={80}
        height={80}
        className="rounded-full mb-4"
      />
      <h3 className="text-lg font-semibold mb-1 flex items-center">
        {community.name}
        <span className="ml-1 text-yellow-400">✦</span>
      </h3>
      {/* <p className="text-sm text-gray-500 mb-4">{community.members} members</p> */}
      <Button variant="outline" className="w-full rounded-xl">
        Join
      </Button>
    </div>
  </Link>
))}
        </div>
      </main>

    </div>
  )
}