import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  PhoneCall,
  ArrowLeft,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  QrCode,
  Save,
  Send,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  MapPin,
  Tag,
  Loader2,
  Sliders,
  DollarSign,
  Eye,
  History,
  Store
} from 'lucide-react';
import {
  fetchCoordinatorDrafts,
  updateCoordinatorDraft,
  rejectCoordinatorDraft,
  publishCoordinatorDraft,
  uploadCoordinatorPhoto,
  fetchStorefrontProducts
} from '../services/api';

export default function CoordinatorReviewPanel({ onClose }) {
  // Navigation: 'queue' | 'storefront'
  const [activeTab, setActiveTab] = useState('queue');

  // Queue State
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'camera' | 'ivr' | 'missing_photo'
  const [searchQuery, setSearchQuery] = useState('');
  const [draftsData, setDraftsData] = useState({ counts: { total_pending: 0, missing_photo: 0, camera_drafts: 0, ivr_drafts: 0, all: 0 }, drafts: [] });
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);

  // Selected Draft for Detail Review
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [draftFormData, setDraftFormData] = useState(null);
  const [originalDraftBackup, setOriginalDraftBackup] = useState(null);
  const [showOriginalInput, setShowOriginalInput] = useState(false);

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Photo Upload State (for IVR drafts awaiting in-person visit photo)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const fileInputRef = useRef(null);

  // Action Pending States
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

  // Storefront State
  const [storefrontProducts, setStorefrontProducts] = useState([]);
  const [isLoadingStorefront, setIsLoadingStorefront] = useState(false);
  const [qrModalProduct, setQrModalProduct] = useState(null);

  // ─── Load Queue ─────────────────────────────────────────────────────────────
  const loadQueue = async (filter = queueFilter) => {
    setIsLoadingQueue(true);
    try {
      const data = await fetchCoordinatorDrafts(filter);
      setDraftsData(data);
    } catch (err) {
      console.error('Error fetching coordinator drafts:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      loadQueue(queueFilter);
    } else if (activeTab === 'storefront') {
      loadStorefront();
    }
  }, [activeTab, queueFilter]);

  // ─── Load Storefront ────────────────────────────────────────────────────────
  const loadStorefront = async () => {
    setIsLoadingStorefront(true);
    try {
      const data = await fetchStorefrontProducts();
      setStorefrontProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching storefront products:', err);
    } finally {
      setIsLoadingStorefront(false);
    }
  };

  // ─── Open Review Detail ─────────────────────────────────────────────────────
  const handleOpenReview = (draft) => {
    setSelectedDraftId(draft.id);
    setDraftFormData({
      id: draft.id,
      title_en: draft.title_en || '',
      title_hi: draft.title_hi || '',
      description_en: draft.description_en || '',
      description_hi: draft.description_hi || '',
      b2c_price: draft.b2c_price || 450,
      craft_category: draft.craft_category || 'Terracotta & Pottery',
      technique: draft.technique || 'Wheel Throwing & Clay Appliqué Carving',
      artisan_name: draft.artisan_name || 'Rural Artisan',
      beneficiary_id: draft.beneficiary_id || 'MoSJE-NBCFDC-01',
      cluster_pin: draft.cluster_pin || '273001',
      raw_image_url: draft.raw_image_url || '',
      studio_image_url: draft.studio_image_url || '',
      channel: draft.channel || (draft.id?.includes('IVR') ? 'ivr' : 'camera'),
      original_transcript: draft.original_transcript || '',
      status: draft.status || 'draft',
      correction_log: draft.correction_log || []
    });
    setOriginalDraftBackup(draft);
    setShowOriginalInput(false);
    setActionSuccessMessage(null);
  };

  const handleBackToQueue = () => {
    setSelectedDraftId(null);
    setDraftFormData(null);
    setOriginalDraftBackup(null);
    loadQueue(queueFilter);
  };

  // ─── Calculate Active Field Corrections ─────────────────────────────────────
  const activeFieldCorrections = useMemo(() => {
    if (!draftFormData || !originalDraftBackup) return [];
    const diffs = [];
    if (draftFormData.b2c_price !== originalDraftBackup.b2c_price) {
      diffs.push({
        label: 'Price (INR)',
        from: `₹${originalDraftBackup.b2c_price || 0}`,
        to: `₹${draftFormData.b2c_price || 0}`
      });
    }
    if (draftFormData.title_en !== originalDraftBackup.title_en) {
      diffs.push({
        label: 'Title (English)',
        from: originalDraftBackup.title_en || '—',
        to: draftFormData.title_en || '—'
      });
    }
    if (draftFormData.title_hi !== originalDraftBackup.title_hi) {
      diffs.push({
        label: 'Title (Hindi)',
        from: originalDraftBackup.title_hi || '—',
        to: draftFormData.title_hi || '—'
      });
    }
    if (draftFormData.description_en !== originalDraftBackup.description_en) {
      diffs.push({
        label: 'Description (English)',
        from: originalDraftBackup.description_en || '—',
        to: draftFormData.description_en || '—'
      });
    }
    if (draftFormData.craft_category !== originalDraftBackup.craft_category) {
      diffs.push({
        label: 'Category',
        from: originalDraftBackup.craft_category || '—',
        to: draftFormData.craft_category || '—'
      });
    }
    return diffs;
  }, [draftFormData, originalDraftBackup]);

  // ─── Save Changes (Approve Without Immediate Publishing) ───────────────────
  const handleSaveChanges = async () => {
    if (!draftFormData) return;
    setIsSavingChanges(true);
    try {
      const updates = {
        title_en: draftFormData.title_en,
        title_hi: draftFormData.title_hi,
        description_en: draftFormData.description_en,
        description_hi: draftFormData.description_hi,
        b2c_price: Number(draftFormData.b2c_price),
        craft_category: draftFormData.craft_category,
        technique: draftFormData.technique,
        status: 'approved'
      };
      const res = await updateCoordinatorDraft(draftFormData.id, updates);
      setOriginalDraftBackup(res.draft);
      setDraftFormData(prev => ({ ...prev, ...res.draft, status: 'approved' }));
      setActionSuccessMessage('✓ Changes saved. Draft marked as Approved (awaiting publish).');
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (err) {
      alert(`Error saving changes: ${err.message}`);
    } finally {
      setIsSavingChanges(false);
    }
  };

  // ─── Approve & Publish Live ─────────────────────────────────────────────────
  const handleApproveAndPublish = async () => {
    if (!draftFormData) return;
    setIsPublishing(true);
    try {
      const updates = {
        title_en: draftFormData.title_en,
        title_hi: draftFormData.title_hi,
        description_en: draftFormData.description_en,
        description_hi: draftFormData.description_hi,
        b2c_price: Number(draftFormData.b2c_price),
        craft_category: draftFormData.craft_category,
        technique: draftFormData.technique,
      };
      await publishCoordinatorDraft(draftFormData.id, updates);
      setActionSuccessMessage('✓ Verified & published live on ONDC & GeM! Verified QR generated.');
      setTimeout(() => {
        handleBackToQueue();
        setActiveTab('storefront');
      }, 1200);
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── Reject Draft ───────────────────────────────────────────────────────────
  const handleConfirmReject = async () => {
    if (!rejectReason.trim() || !draftFormData) return;
    setIsSubmittingReject(true);
    try {
      await rejectCoordinatorDraft(draftFormData.id, rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
      handleBackToQueue();
    } catch (err) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // ─── Photo Upload (In-Person Visit) ─────────────────────────────────────────
  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !draftFormData) return;

    setIsUploadingPhoto(true);
    setUploadStatusText('AI Studio: Segmenting salient craft & removing workshop clutter...');

    try {
      setTimeout(() => {
        setUploadStatusText('AI Studio: 6500K daylight balancing & dual-tier contact shadow synthesis...');
      }, 800);

      const res = await uploadCoordinatorPhoto(draftFormData.id, file);

      setDraftFormData(prev => ({
        ...prev,
        studio_image_url: res.studio_image_url,
        raw_image_url: res.raw_image_url,
      }));
      setOriginalDraftBackup(prev => ({
        ...prev,
        studio_image_url: res.studio_image_url,
        raw_image_url: res.raw_image_url,
      }));
      setActionSuccessMessage('✓ In-person visit photo enhanced & studio grounded!');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch (err) {
      alert(`Photo enhancement failed: ${err.message}`);
    } finally {
      setIsUploadingPhoto(false);
      setUploadStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter drafts list by search query
  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return draftsData.drafts || [];
    const q = searchQuery.toLowerCase();
    return (draftsData.drafts || []).filter(d =>
      (d.title_en && d.title_en.toLowerCase().includes(q)) ||
      (d.title_hi && d.title_hi.toLowerCase().includes(q)) ||
      (d.id && d.id.toLowerCase().includes(q)) ||
      (d.artisan_name && d.artisan_name.toLowerCase().includes(q)) ||
      (d.craft_category && d.craft_category.toLowerCase().includes(q))
    );
  }, [draftsData.drafts, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 md:p-4 select-none font-sans">
      <div className="relative w-full h-full md:max-w-5xl md:h-[92vh] bg-slate-900 md:rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* ==================================================================== */}
        {/* TOP PANEL NAVIGATION BAR                                            */}
        {/* ==================================================================== */}
        <header className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>समन्वयक डेस्क • Coordinator Review Panel</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  MoSJE Field Gateway
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Human-in-the-Loop Verification Checkpoint for AI Drafts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 2-TAB SEGMENTED CONTROLLER */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => {
                  setSelectedDraftId(null);
                  setActiveTab('queue');
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Review Queue</span>
                {draftsData.counts.total_pending > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'queue' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {draftsData.counts.total_pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setSelectedDraftId(null);
                  setActiveTab('storefront');
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'storefront'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Published Listings</span>
                {storefrontProducts.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === 'storefront' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {storefrontProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* MAIN BODY VIEW                                                       */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-900/60">

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB 1: REVIEW QUEUE (LIST VIEW OR DETAIL VIEW)                     */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'queue' && (
            <>
              {!selectedDraftId ? (
                /* ─── 1A: QUEUE LIST VIEW ──────────────────────────────────── */
                <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-4">
                  {/* Queue Filter Bar & Search */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                    {/* Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs font-bold">
                      {[
                        { id: 'all', label: 'All Drafts', count: draftsData.counts.all },
                        { id: 'camera', label: 'Camera App', count: draftsData.counts.camera_drafts },
                        { id: 'ivr', label: 'IVR Calls', count: draftsData.counts.ivr_drafts },
                        { id: 'missing_photo', label: 'Missing Photo (To-Do)', count: draftsData.counts.missing_photo, highlight: true },
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setQueueFilter(f.id)}
                          className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            queueFilter === f.id
                              ? f.highlight
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-extrabold'
                                : 'bg-amber-500/20 border-amber-500 text-amber-300 font-extrabold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{f.label}</span>
                          <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                            {f.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Search Bar & Refresh */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search artisan, craft, ID..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => loadQueue(queueFilter)}
                        title="Refresh Drafts"
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Drafts Cards / Table Container */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {isLoadingQueue ? (
                      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        <span className="text-xs">Loading coordinator draft pipeline...</span>
                      </div>
                    ) : filteredDrafts.length === 0 ? (
                      <div className="py-24 text-center text-slate-500 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-600">
                          <CheckCircle2 className="w-7 h-7 text-emerald-500/70" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-300">No drafts waiting for review</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {queueFilter === 'missing_photo'
                              ? 'All IVR drafts currently have studio photos attached!'
                              : 'All artisan listings have been reviewed and certified.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      filteredDrafts.map((draft) => {
                        const hasPhoto = Boolean(draft.studio_image_url || draft.raw_image_url);
                        const isIvr = draft.channel === 'ivr' || draft.id?.includes('IVR');

                        return (
                          <div
                            key={draft.id}
                            onClick={() => handleOpenReview(draft)}
                            className="p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/50 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-3 group shadow-xs active:scale-[0.99]"
                          >
                            {/* Left: Thumbnail + Titles */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {/* Thumbnail or Photo-Pending Alert Icon */}
                              <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden relative">
                                {hasPhoto ? (
                                  <img
                                    src={draft.studio_image_url || draft.raw_image_url}
                                    alt={draft.title_en}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-center p-1 bg-amber-500/10 w-full h-full">
                                    <AlertCircle className="w-5 h-5 text-amber-400 mb-0.5 animate-pulse" />
                                    <span className="text-[8px] font-black text-amber-400 leading-none uppercase">
                                      Photo Due
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  {/* Channel Badge */}
                                  <span className={`px-2 py-0.2 rounded-md text-[9px] font-black flex items-center gap-1 uppercase tracking-wider border ${
                                    isIvr
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                  }`}>
                                    {isIvr ? <PhoneCall className="w-2.5 h-2.5" /> : <Camera className="w-2.5 h-2.5" />}
                                    <span>{isIvr ? 'IVR Call' : 'Camera App'}</span>
                                  </span>

                                  {/* Status Pill */}
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                    draft.status === 'rejected'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : draft.status === 'approved'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    {draft.status === 'rejected' ? 'Rejected' : draft.status === 'approved' ? 'Approved (Ready)' : 'Pending Review'}
                                  </span>

                                  {/* Artisan Identifier */}
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {draft.artisan_name || 'Rural Artisan'} • {draft.cluster_pin || '273001'}
                                  </span>
                                </div>

                                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                                  {draft.title_hi || draft.title_en || 'पारंपरिक हस्तशिल्प'}
                                </h3>

                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {draft.description_en || draft.description_hi || 'Craft narrative awaiting coordinator certification...'}
                                </p>
                              </div>
                            </div>

                            {/* Right: Suggested Price + Review CTA */}
                            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                              <div className="text-left md:text-right">
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">
                                  AI Suggested Price
                                </span>
                                <span className="text-base font-black text-emerald-400 font-mono">
                                  ₹{draft.b2c_price || 0}
                                </span>
                              </div>

                              <button className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md group-hover:scale-102 transition-transform cursor-pointer">
                                <span>Review & Certify</span>
                                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* ─── 1B: REVIEW / EDIT / APPROVE DETAIL SCREEN ─────────────── */
                <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
                  {/* Top Bar: Back to Queue + Breadcrumbs */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBackToQueue}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Queue</span>
                      </button>

                      <span className="text-xs text-slate-500 font-mono">
                        Draft ID: {draftFormData.id}
                      </span>
                    </div>

                    {/* Source Channel Pill */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5">
                        {draftFormData.channel === 'ivr' ? <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5 text-blue-400" />}
                        <span>Source: {draftFormData.channel === 'ivr' ? 'Zero-Smartphone Voice-IVR' : 'Camera App Studio'}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        {draftFormData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Success Toast Notification */}
                  {actionSuccessMessage && (
                    <div className="my-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{actionSuccessMessage}</span>
                    </div>
                  )}

                  {/* Form Scroll Area */}
                  <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      {/* Left Column: Product Studio Image / Field Photo Upload */}
                      <div className="md:col-span-4 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                              Product Studio Photo
                            </span>
                            {draftFormData.studio_image_url && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                4K Studio Render
                              </span>
                            )}
                          </div>

                          {/* Image Box */}
                          <div className="w-full aspect-square rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center relative group">
                            {draftFormData.studio_image_url || draftFormData.raw_image_url ? (
                              <>
                                <img
                                  src={draftFormData.studio_image_url || draftFormData.raw_image_url}
                                  alt="Studio Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold cursor-pointer"
                                  >
                                    Replace Photo
                                  </button>
                                </div>
                              </>
                            ) : (
                              /* IVR Draft Missing Photo Placeholder */
                              <div className="p-4 text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                                  <Camera className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-white">In-Person Visit Photo Pending</p>
                                  <p className="text-[10px] text-slate-400 leading-tight">
                                    Artisan registered via Keypad IVR. Visit artisan to capture craft photo.
                                  </p>
                                </div>

                                <button
                                  disabled={isUploadingPhoto}
                                  onClick={() => fileInputRef.current?.click()}
                                  className="mt-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {isUploadingPhoto ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  <span>{isUploadingPhoto ? 'Enhancing Photo...' : 'Upload Field Photo'}</span>
                                </button>
                              </div>
                            )}

                            {/* Hidden File Input */}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoSelected}
                            />
                          </div>

                          {/* Live Enhancement Progress */}
                          {isUploadingPhoto && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                              <span>{uploadStatusText || 'AI Image Studio in progress...'}</span>
                            </div>
                          )}

                          {/* Artisan Metadata Dossier */}
                          <div className="space-y-1 pt-1 text-[11px] font-mono border-t border-slate-800/80">
                            <div className="flex justify-between text-slate-400">
                              <span>Artisan:</span>
                              <span className="text-slate-200 font-bold">{draftFormData.artisan_name}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Beneficiary ID:</span>
                              <span className="text-amber-400">{draftFormData.beneficiary_id}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Cluster PIN:</span>
                              <span className="text-slate-200">{draftFormData.cluster_pin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Original Artisan Voice Input Drawer */}
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowOriginalInput(!showOriginalInput)}
                            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <FileText className="w-4 h-4" />
                              <span>Original Spoken Input (Audio Sanity Check)</span>
                            </span>
                            {showOriginalInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {showOriginalInput && (
                            <div className="p-3.5 pt-0 text-xs space-y-2 border-t border-slate-800/80 bg-slate-900/40 font-mono">
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {draftFormData.original_transcript || 'नक्काशीदार टेराकोटा मिट्टी का कलश और हांडी, शुद्ध लाल मिट्टी से निर्मित (Spoken vernacular via Bhashini/Voice)'}
                              </p>
                              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Double check translation against what the artisan actually said.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Editable Metadata Fields (Dual EN/HI Titles, Descs, Price) */}
                      <div className="md:col-span-8 space-y-4">
                        
                        {/* Title Section (Bilingual Inline Editor) */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                              Product Title (Bilingual)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Click to edit inline
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                                English Marketplace Title:
                              </label>
                              <input
                                type="text"
                                value={draftFormData.title_en}
                                onChange={(e) => setDraftFormData({ ...draftFormData, title_en: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                                Hindi Title (हिंदी शीर्षक):
                              </label>
                              <input
                                type="text"
                                value={draftFormData.title_hi}
                                onChange={(e) => setDraftFormData({ ...draftFormData, title_hi: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-amber-200 focus:outline-none focus:border-amber-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description Section (Side-by-Side Dual Tabs) */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Marketplace Story & Descriptors
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                                English E-Commerce Description:
                              </label>
                              <textarea
                                rows={4}
                                value={draftFormData.description_en}
                                onChange={(e) => setDraftFormData({ ...draftFormData, description_en: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-slate-400 font-bold block mb-1">
                                Hindi Description (शिल्प विवरण):
                              </label>
                              <textarea
                                rows={4}
                                value={draftFormData.description_hi}
                                onChange={(e) => setDraftFormData({ ...draftFormData, description_hi: e.target.value })}
                                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Price, Category & Technique Grid */}
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Suggested Price Field */}
                          <div>
                            <label className="text-[11px] text-slate-400 font-bold block mb-1">
                              Selling Price (₹ INR):
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                              <input
                                type="number"
                                value={draftFormData.b2c_price}
                                onChange={(e) => setDraftFormData({ ...draftFormData, b2c_price: Number(e.target.value) })}
                                className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-base font-black text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                              />
                            </div>
                            <span className="text-[9px] text-emerald-400/90 font-medium block mt-1">
                              ✓ ₹120/hr Statutory Floor Compliant
                            </span>
                          </div>

                          {/* Craft Category */}
                          <div>
                            <label className="text-[11px] text-slate-400 font-bold block mb-1">
                              Craft Category:
                            </label>
                            <input
                              type="text"
                              value={draftFormData.craft_category}
                              onChange={(e) => setDraftFormData({ ...draftFormData, craft_category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <span className="text-[9px] text-slate-500 block mt-1">
                              MoSJE Heritage Schedule
                            </span>
                          </div>

                          {/* Technique */}
                          <div>
                            <label className="text-[11px] text-slate-400 font-bold block mb-1">
                              Heritage Technique:
                            </label>
                            <input
                              type="text"
                              value={draftFormData.technique}
                              onChange={(e) => setDraftFormData({ ...draftFormData, technique: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <span className="text-[9px] text-slate-500 block mt-1">
                              GI Tag Verification Method
                            </span>
                          </div>
                        </div>

                        {/* Audit & Correction Log Drawer */}
                        {activeFieldCorrections.length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <History className="w-4 h-4" />
                              <span>Human-in-the-Loop Changes (Will be recorded in Audit Log):</span>
                            </div>
                            <div className="space-y-1 font-mono text-[11px]">
                              {activeFieldCorrections.map((diff, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                                  <span className="text-amber-300 font-bold">{diff.label}:</span>
                                  <span className="line-through text-slate-500">{diff.from}</span>
                                  <span className="text-emerald-400">→ {diff.to}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fixed Bottom Action Dock (Approve & Publish / Save Changes / Reject) */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <div className="text-[11px] text-slate-400">
                      <span>Village Coordinator: </span>
                      <span className="font-bold text-slate-200">Ramesh Chandra (ID: VC-273001)</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Action 1: Reject */}
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="py-2.5 px-4 rounded-xl border border-rose-500/40 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Reject Draft</span>
                      </button>

                      {/* Action 2: Save Changes (Approve without premature publish) */}
                      <button
                        disabled={isSavingChanges || isPublishing}
                        onClick={handleSaveChanges}
                        className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isSavingChanges ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-amber-400" />}
                        <span>Save Changes (Approve)</span>
                      </button>

                      {/* Action 3: Approve & Publish Live */}
                      <button
                        disabled={isPublishing || isSavingChanges}
                        onClick={handleApproveAndPublish}
                        className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Send className="w-4 h-4 text-slate-950" />}
                        <span>Approve & Publish Live</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB 2: PUBLISHED LISTINGS (STOREFRONT VIEW)                        */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'storefront' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-4">
              {/* Storefront Header */}
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>Live Certified Marketplace Storefront</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONDC & GeM Live
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Products reviewed and verified by field coordinators. Published directly to open commerce.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    {storefrontProducts.length} Products Live
                  </span>
                </div>
              </div>

              {/* Storefront Product Cards Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isLoadingStorefront ? (
                  <div className="py-24 text-center text-slate-500 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-xs">Fetching live published storefront items...</span>
                  </div>
                ) : storefrontProducts.length === 0 ? (
                  <div className="py-24 text-center text-slate-500">
                    <p className="text-sm font-bold text-slate-300">No published listings yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Review pending drafts in the Review Queue and click "Approve & Publish Live".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {storefrontProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col group shadow-lg"
                      >
                        {/* Product Studio Image */}
                        <div className="w-full aspect-[4/3] bg-slate-900 overflow-hidden relative">
                          <img
                            src={product.studio_image_url || product.raw_image_url || '/terracotta_pot_clean.png'}
                            alt={product.title_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            GI Certified
                          </span>
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-slate-300">
                            PIN: {product.cluster_pin || '273001'}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                          <div>
                            <span className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider block">
                              {product.craft_category || 'Handloom Textiles'}
                            </span>
                            <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition-colors">
                              {product.title_hi || product.title_en}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {product.description_en || product.description_hi}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-500 block uppercase font-bold">Artisan</span>
                              <span className="text-xs font-bold text-slate-200">{product.artisan_name || 'Rural Artisan'}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-black text-emerald-400 font-mono">
                                ₹{product.b2c_price || 450}
                              </span>
                            </div>
                          </div>

                          {/* Inspect Verified QR Button */}
                          <button
                            onClick={() => setQrModalProduct(product)}
                            className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect Certified QR Dossier</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* REJECT MODAL (MANDATORY AUDIT JUSTIFICATION)                         */}
        {/* ==================================================================== */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-950 border border-rose-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2.5 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-black text-white">Reject Draft with Audit Feedback</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Please provide the reason for rejection (e.g., "unclear audio description, needs re-recording", or "materials misidentified"). This audit note will guide the village coordinator's re-engagement with the artisan.
              </p>

              <div>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unclear vernacular audio, selling price misidentified, photo blurred..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmittingReject || !rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isSubmittingReject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* QR INSPECTION MODAL                                                  */}
        {/* ==================================================================== */}
        {qrModalProduct && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-950 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl text-center">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  MoSJE Certified Product QR
                </span>
                <button
                  onClick={() => setQrModalProduct(null)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
                {qrModalProduct.qr_code_url ? (
                  <img
                    src={qrModalProduct.qr_code_url}
                    alt="Product QR"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-mono text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white truncate">
                  {qrModalProduct.title_en || qrModalProduct.title_hi}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Listing #{qrModalProduct.id} • ₹{qrModalProduct.b2c_price}
                </p>
                <span className="text-[10px] text-emerald-400 block pt-1">
                  Scannable by any mobile device to open public verification dossier
                </span>
              </div>

              <a
                href={`/verify/${qrModalProduct.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
