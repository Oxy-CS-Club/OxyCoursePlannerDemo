import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CollectionsPage } from "./pages/CollectionsPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RatingsPlaceholderPage } from "./pages/RatingsPlaceholderPage";
import { SearchPage } from "./pages/SearchPage";
import { VisualizerPage } from "./pages/VisualizerPage";

export default function App() {
  return (
    <Routes>
      {/* Opened in a new browser tab from the course detail page. */}
      <Route path="/ratings-placeholder" element={<RatingsPlaceholderPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
