import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TemplateForm } from '../components/TemplateForm';
import { TemplateList } from '../components/TemplateList';
import { StyleForm } from '../components/StyleForm';
import { StyleList } from '../components/StyleList';
import type { ImageType, ProjectTemplate, CreateTemplateDto, Style, CreateStyleDto, UpdateStyleDto } from '../types';

export function Dashboard() {
  const { user, logout } = useAuth();
  const [imageTypes, setImageTypes] = useState<ImageType[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'createStyle' | 'styles'>('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesData, stylesData, templatesData] = await Promise.all([
        api.getImageTypes(),
        api.getStyles(),
        api.getTemplates(),
      ]);
      console.log('Styles data:', stylesData);
      console.log('First style imageTypes:', stylesData[0]?.imageTypes);
      setImageTypes(typesData);
      setStyles(stylesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingTypes(false);
      setIsLoadingStyles(false);
      setIsLoadingTemplates(false);
    }
  };

  const handleCreateTemplate = async (data: CreateTemplateDto) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const newTemplate = await api.createTemplate(data);
      setTemplates((prev) => [newTemplate, ...prev]);
      setSuccessMessage(`Template "${newTemplate.title}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const template = templates.find((t) => t.id === id);
    await api.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setSuccessMessage(`Template "${template?.title}" deleted successfully!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleCreateStyle = async (data: CreateStyleDto) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const newStyle = await api.createStyle(data);
      setStyles((prev) => [...prev, newStyle].sort((a, b) => a.name.localeCompare(b.name)));
      setSuccessMessage(`Style "${newStyle.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStyle = async (id: string) => {
    const style = styles.find((s) => s.id === id);
    await api.deleteStyle(id);
    setStyles((prev) => prev.filter((s) => s.id !== id));
    setSuccessMessage(`Style "${style?.name}" deleted successfully!`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleUpdateStyle = async (id: string, data: UpdateStyleDto) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const updatedStyle = await api.updateStyle(id, data);
      setStyles((prev) =>
        prev.map((s) => (s.id === updatedStyle.id ? updatedStyle : s))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setSuccessMessage(`Style "${updatedStyle.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.signOut();
    } catch {
      // Ignore errors
    }
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PlanVision</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-200 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {/* Template Tabs */}
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'create'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Template
            </span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              View Templates ({templates.length})
            </span>
          </button>

          {/* Divider */}
          <div className="w-px bg-white/10 mx-2 hidden sm:block" />

          {/* Style Tabs */}
          <button
            onClick={() => setActiveTab('createStyle')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'createStyle'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Create Style
            </span>
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'styles'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View Styles ({styles.length})
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'create' && (
          <div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create New Template</h2>
              <p className="text-slate-400 mb-6">
                Add a new template card for the PlanVision iOS app home screen.
              </p>
              {isLoadingTypes ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <TemplateForm
                  imageTypes={imageTypes}
                  styles={styles}
                  isLoadingStyles={isLoadingStyles}
                  onSubmit={handleCreateTemplate}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Existing Templates</h2>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <TemplateList templates={templates} isLoading={isLoadingTemplates} onDelete={handleDeleteTemplate} />
          </div>
        )}

        {activeTab === 'createStyle' && (
          <div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create New Style</h2>
              <p className="text-slate-400 mb-6">
                Add a new design style that can be applied to image generations.
              </p>
              {isLoadingTypes ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <StyleForm
                  imageTypes={imageTypes}
                  onSubmit={handleCreateStyle}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'styles' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Existing Styles</h2>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <StyleList
              styles={styles}
              imageTypes={imageTypes}
              isLoading={isLoadingStyles}
              onDelete={handleDeleteStyle}
              onUpdate={handleUpdateStyle}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}
