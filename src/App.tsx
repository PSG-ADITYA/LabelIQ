import React from 'react';
import { LabelProvider, useLabel } from './context/LabelContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateLabelPage } from './pages/CreateLabelPage';
import { ScannerPage } from './pages/ScannerPage';
import { EditorPage } from './pages/EditorPage';
import { ValidationPage } from './pages/ValidationPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { BatchManagementPage } from './pages/BatchManagementPage';
import { DesignRecommendationsPage } from './pages/DesignRecommendationsPage';
import { AiDraftPage } from './pages/AiDraftPage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';

const AppContent: React.FC = () => {
  const { activeTab } = useLabel();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-slate-800 font-sans selection:bg-limeaccent-200 selection:text-forest-900">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'ai-draft' && <AiDraftPage />}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'batches' && <BatchManagementPage />}
        {activeTab === 'create' && <CreateLabelPage />}
        {activeTab === 'scanner' && <ScannerPage />}
        {activeTab === 'editor' && <EditorPage />}
        {activeTab === 'recommendations' && <DesignRecommendationsPage />}
        {activeTab === 'validation' && <ValidationPage />}
        {activeTab === 'comparison' && <ComparisonPage />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'settings' && <SettingsPage />}
        {activeTab === 'verify' && <PublicVerifyPage />}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <LabelProvider>
      <AppContent />
    </LabelProvider>
  );
}

export default App;
