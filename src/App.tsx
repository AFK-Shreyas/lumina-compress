import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { NotifyProvider } from './context/NotifyContext'
import { ThemeProvider } from './context/ThemeProvider'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'

const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))
const ResizeImagePage = lazy(() =>
  import('./pages/tools/ResizeImagePage').then((m) => ({ default: m.ResizeImagePage }))
)
const CropImagePage = lazy(() => import('./pages/tools/CropImagePage').then((m) => ({ default: m.CropImagePage })))
const Compress20KbPage = lazy(() =>
  import('./pages/tools/TargetKbPages').then((m) => ({ default: m.Compress20KbPage }))
)
const Compress50KbPage = lazy(() =>
  import('./pages/tools/TargetKbPages').then((m) => ({ default: m.Compress50KbPage }))
)
const Compress100KbPage = lazy(() =>
  import('./pages/tools/TargetKbPages').then((m) => ({ default: m.Compress100KbPage }))
)
const Compress200KbPage = lazy(() =>
  import('./pages/tools/TargetKbPages').then((m) => ({ default: m.Compress200KbPage }))
)
const PassportPhotoPage = lazy(() =>
  import('./pages/tools/PassportPhotoPage').then((m) => ({ default: m.PassportPhotoPage }))
)
const InstagramImageResizerPage = lazy(() =>
  import('./pages/tools/InstagramImageResizerPage').then((m) => ({ default: m.InstagramImageResizerPage }))
)
const YoutubeThumbnailResizerPage = lazy(() =>
  import('./pages/tools/YoutubeThumbnailResizerPage').then((m) => ({ default: m.YoutubeThumbnailResizerPage }))
)

export default function App() {
  return (
    <ThemeProvider>
      <NotifyProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600 dark:text-slate-400">
                Loading…
              </div>
            }
          >
            <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="resize-image" element={<ResizeImagePage />} />
              <Route path="crop-image" element={<CropImagePage />} />
              <Route path="compress-image-to-20kb" element={<Compress20KbPage />} />
              <Route path="compress-image-to-50kb" element={<Compress50KbPage />} />
              <Route path="compress-image-to-100kb" element={<Compress100KbPage />} />
              <Route path="compress-image-to-200kb" element={<Compress200KbPage />} />
              <Route path="passport-photo-maker" element={<PassportPhotoPage />} />
              <Route path="instagram-image-resizer" element={<InstagramImageResizerPage />} />
              <Route path="youtube-thumbnail-resizer" element={<YoutubeThumbnailResizerPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotifyProvider>
    </ThemeProvider>
  )
}
