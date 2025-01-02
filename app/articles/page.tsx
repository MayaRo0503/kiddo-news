'use client'

import { useState } from 'react'
import ArticleCarousel from '../components/ArticleCarousel'

const articles = [
  { id: 1, title: 'Exciting Science Discovery', category: 'Science', image: '/placeholder.svg?height=200&width=300' },
  { id: 2, title: 'New Animal Species Found', category: 'Nature', image: '/placeholder.svg?height=200&width=300' },
  { id: 3, title: 'Space Exploration Update', category: 'Space', image: '/placeholder.svg?height=200&width=300' },
  { id: 4, title: 'Environmental Conservation Efforts', category: 'Environment', image: '/placeholder.svg?height=200&width=300' },
  { id: 5, title: 'Technology Advancements', category: 'Technology', image: '/placeholder.svg?height=200&width=300' },
  { id: 6, title: 'History of Ancient Civilizations', category: 'History', image: '/placeholder.svg?height=200&width=300' },
  { id: 7, title: 'Fun Math Puzzles', category: 'Mathematics', image: '/placeholder.svg?height=200&width=300' },
  { id: 8, title: 'Exploring World Cultures', category: 'Culture', image: '/placeholder.svg?height=200&width=300' },
]

const categories = ['All', 'Science', 'Nature', 'Space', 'Environment', 'Technology', 'History', 'Mathematics', 'Culture']

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(article => article.category === selectedCategory)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-600">Explore Kiddo News Articles</h1>
      
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-500 hover:bg-blue-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">{selectedCategory} Articles</h2>
        <ArticleCarousel articles={filteredArticles} />
      </div>
    </div>
  )
}

