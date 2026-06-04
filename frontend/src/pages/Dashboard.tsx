import { useState, useEffect } from 'react'
import type { Garment } from '../types/garment'
import { Category } from '../types/garment'
import * as garmentService from '../services/garmentService'
import GarmentGrid from '../components/garment/GarmentGrid'
import CategoryFilter from '../components/garment/CategoryFilter'
import AddGarmentModal from '../components/garment/AddGarmentModal'
import EditGarmentModal from '../components/garment/EditGarmentModal'
import DeleteConfirmDialog from '../components/garment/DeleteConfirmDialog'
import MainLayout from '../components/MainLayout'

const Dashboard = () => {
  const [mounted, setMounted] = useState(false)
  const [garments, setGarments] = useState<Garment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editGarment, setEditGarment] = useState<Garment | null>(null)
  const [deleteGarment, setDeleteGarment] = useState<Garment | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    garmentService
      .getAll(activeCategory ?? undefined)
      .then((data) => {
        setGarments(data)
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        setError('Nie udało się załadować garderoby. Sprawdź połączenie i spróbuj ponownie.')
        setLoading(false)
      })
  }, [refreshKey, activeCategory])

  const handleCategoryChange = (category: Category | null) => {
    setActiveCategory(category)
    setLoading(true)
    setError(null)
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }

  return (
    <MainLayout>
      <main className="max-w-5xl mx-auto px-6 sm:px-10 py-14 sm:py-20">
        {/* Page heading */}
        <div
          className={`mb-14 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p style={{ letterSpacing: '0.24em' }} className="text-xs uppercase text-[#C8906A] mb-4">
            My Collection
          </p>
          <h2
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-5xl sm:text-7xl font-light leading-none"
          >
            Your Wardrobe
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-10 h-px bg-[#C8906A]" />
            <span style={{ letterSpacing: '0.08em' }} className="text-sm text-[#9A9590] font-light">
              {garments.length} {garments.length === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
        </div>

        {/* Clothing grid area */}
        <div
          className={`transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div
            style={{ borderBottom: '1px solid #E8E4DF' }}
            className="flex items-center justify-between pb-3 mb-8"
          >
            <span style={{ letterSpacing: '0.18em' }} className="text-xs uppercase text-[#A09A93]">
              Clothing Items
            </span>
            <button onClick={() => setModalOpen(true)} className="relative group py-1">
              <span
                style={{ fontFamily: "'Jost', sans-serif", letterSpacing: '0.14em' }}
                className="text-xs uppercase text-[#C8906A] group-hover:text-[#1A1A18] transition-colors duration-200"
              >
                + Dodaj ubranie
              </span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[#C8906A] group-hover:w-full transition-all duration-300 ease-out" />
            </button>
          </div>

          <CategoryFilter active={activeCategory} onChange={handleCategoryChange} />

          <GarmentGrid
            garments={garments}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onEdit={setEditGarment}
            onDelete={setDeleteGarment}
          />
        </div>
      </main>
      {modalOpen && (
        <AddGarmentModal
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
      {editGarment && (
        <EditGarmentModal
          garment={editGarment}
          onClose={() => setEditGarment(null)}
          onSuccess={() => {
            setEditGarment(null)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
      {deleteGarment && (
        <DeleteConfirmDialog
          garment={deleteGarment}
          onClose={() => setDeleteGarment(null)}
          onSuccess={() => {
            setDeleteGarment(null)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </MainLayout>
  )
}

export default Dashboard
