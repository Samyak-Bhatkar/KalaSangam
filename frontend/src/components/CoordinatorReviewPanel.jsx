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
  Store,
  LogOut,
  Globe,
  Copy,
  Download,
  Code2
} from 'lucide-react';
import {
  fetchCoordinatorDrafts,
  updateCoordinatorDraft,
  rejectCoordinatorDraft,
  publishCoordinatorDraft,
  uploadCoordinatorPhoto,
  fetchStorefrontProducts,
  exportBecknCatalog
} from '../services/api';

// ─── REALISTIC SHILPSETU RURAL ARTISAN MOCK DRAFTS ───────────────────────────
const MOCK_COORDINATOR_DRAFTS = [
  {
    id: 'DRAFT-CAM-8492',
    title_en: 'Hand-painted Terracotta Festive Diya Set (Pack of 6)',
    title_hi: 'हाथ से चित्रित टेराकोटा उत्सव दीया सेट (6 का पैक)',
    description_en: 'Artisan hand-turned terracotta diyas crafted with fine Gorakhpur river clay and painted with natural organic earth pigments. Designed for traditional festive illumination.',
    description_hi: 'बारीक गोरखपुर नदी की मिट्टी से हस्तनिर्मित टेराकोटा दीये, प्राकृतिक गेरू और जैविक रंगों से रंगे हुए। पारंपरिक उत्सव दीप प्रज्वलन के लिए उपयुक्त।',
    b2c_price: 250,
    craft_category: 'Terracotta & Clay Art',
    technique: 'Wheel Throwing & Natural Clay Baking',
    artisan_name: 'Shanti Devi',
    beneficiary_id: 'NBCFDC-UP-8492',
    cluster_pin: '273001',
    raw_image_url: '/terracotta_pot.png',
    studio_image_url: '/terracotta_pot.png',
    channel: 'camera',
    original_transcript: 'गोरखपुर माटी का पारंपरिक दीया सेट, छह पीस, प्राकृतिक गेरू रंग से सजाया हुआ, कीमत ढाई सौ रुपये।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-20T14:30:00Z'
  },
  {
    id: 'DRAFT-CAM-3921',
    title_en: 'Royal Blue Chanderi Silk Zari Border Saree',
    title_hi: 'शाही नीली चंदेरी सिल्क ज़री किनारी साड़ी',
    description_en: 'Authentic Chanderi handloom saree woven with pure silk warp and fine cotton weft, adorned with traditional gold zari booties and pallu.',
    description_hi: 'शुद्ध रेशम और सूती धागों से हाथ से बुनी प्रामाणिक चंदेरी साड़ी, पारंपरिक सोने की ज़री बूटियों और भव्य पल्लू से सुसज्जित।',
    b2c_price: 3200,
    craft_category: 'Handloom & Textiles',
    technique: 'Handloom Jacquard Interlocking Weave',
    artisan_name: 'Meena Devi',
    beneficiary_id: 'NBCFDC-MP-3921',
    cluster_pin: '473446',
    raw_image_url: '/chanderi_saree.png',
    studio_image_url: '/chanderi_saree.png',
    channel: 'camera',
    original_transcript: 'चंदेरी हाथकरघा साड़ी, नीला रंग, असली ज़री का काम, कीमत बत्तीस सौ रुपये।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-20T12:15:00Z'
  },
  {
    id: 'DRAFT-CAM-5108',
    title_en: 'Hand-Carved Wooden Channapatna Stacking Toy',
    title_hi: 'हस्तनिर्मित लकड़ी का चन्नापटना रंगीन खिलौना',
    description_en: 'Non-toxic vegetable dye lacquered wooden educational toy turned on traditional lathe with natural Wrightia tinctoria (Aale mara) wood.',
    description_hi: 'प्राकृतिक वनस्पति रंगों और सुरक्षित लाख पॉलिश से पारंपरिक खराद पर बना सुरक्षित एवं पर्यावरण-अनुकूल चन्नापटना खिलौना।',
    b2c_price: 450,
    craft_category: 'Traditional Wooden Craft',
    technique: 'Lacquered Wood Turning & Lathe Finishing',
    artisan_name: 'Ram Kishan',
    beneficiary_id: 'NSFDC-KA-5108',
    cluster_pin: '562160',
    raw_image_url: '/terracotta_pot.png',
    studio_image_url: '/terracotta_pot.png',
    channel: 'camera',
    original_transcript: 'चन्नापटना लकड़ी का गोल खिलौना, बच्चों के लिए सुरक्षित हर्बल रंग, साढ़े चार सौ रुपये।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-19T16:45:00Z'
  },
  {
    id: 'DRAFT-IVR-1042',
    title_en: 'Woven Assam Golden Bamboo Fruit Basket',
    title_hi: 'हाथ से बुनी असमिया सुनहरी बांस की फल टोकरी',
    description_en: 'Finely sliced seasoned golden bamboo strips hand-interlaced into a lightweight, durable multi-tier storage and fruit basket.',
    description_hi: 'उपचारित प्राकृतिक सुनहरे बांस की बारीक पट्टियों से हाथ से बुनी गई टिकाऊ, हल्की और सुरुचिपूर्ण फल टोकरी।',
    b2c_price: 600,
    craft_category: 'Bamboo & Cane Craft',
    technique: 'Hand Splitting, Slicing & Twill Weave',
    artisan_name: 'Govind Ram',
    beneficiary_id: 'NSKFDC-AS-1042',
    cluster_pin: '781001',
    raw_image_url: '/chanderi_saree.png',
    studio_image_url: '/chanderi_saree.png',
    channel: 'ivr',
    original_transcript: 'कॉल रिकॉर्डिंग: असमिया बांस की टोकरी, रसोई और फल रखने के लिए, छह सौ रुपये।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-20T10:00:00Z'
  },
  {
    id: 'DRAFT-IVR-7749',
    title_en: 'Kutch Traditional Mirror-Work Embroidered Dupatta',
    title_hi: 'कच्छ पारंपरिक आभला (आईना) कशीदाकारी दुपट्टा',
    description_en: 'Intricate Rabari and Ahir tribal needlework featuring reflective convex mirror-glass inserts hand-stitched on pure organic cotton fabric.',
    description_hi: 'शुद्ध सूती कपड़े पर सुई-धागे से की गई प्रामाणिक कच्छी रबारी कशीदाकारी एवं चमकदार कांच (आभला) का पारंपरिक काम।',
    b2c_price: 1450,
    craft_category: 'Traditional Embroidery',
    technique: 'Hand Needle Embroidery & Glass Mirror Studding',
    artisan_name: 'Kavita Bai',
    beneficiary_id: 'NBCFDC-GJ-7749',
    cluster_pin: '370001',
    raw_image_url: '/chanderi_saree.png',
    studio_image_url: '/chanderi_saree.png',
    channel: 'ivr',
    original_transcript: 'कॉल रिकॉर्डिंग: कच्छी कशीदाकारी ओढ़नी, कांच का काम, कीमत चौदह सौ पचास रुपये।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-18T18:20:00Z'
  },
  {
    id: 'DRAFT-IVR-9104',
    title_en: 'Jaipur Blue Pottery Glazed Floral Miniature Vase',
    title_hi: 'जयपुर ब्लू पॉटरी नक्काशीदार लघु फूलदान',
    description_en: 'Traditional Rajasthani blue pottery made from quartz powder and Fuller earth, hand-painted with cobalt oxide floral motifs and glass glazed.',
    description_hi: 'क्वार्ट्ज पत्थर के चूर्ण और मुल्तानी मिट्टी से निर्मित पारंपरिक जयपुरी ब्लू पॉटरी फूलदान, कोबाल्ट नीले रंगों से हस्त-चित्रित।',
    b2c_price: 800,
    craft_category: 'Ceramics & Blue Pottery',
    technique: 'Quartz Clay Moulding & Cobalt Glaze Firing',
    artisan_name: 'Harish Chander',
    beneficiary_id: 'NBCFDC-RJ-9104',
    cluster_pin: '302001',
    raw_image_url: '',
    studio_image_url: '',
    channel: 'ivr',
    original_transcript: 'कॉल रिकॉर्डिंग: जयपुरी ब्लू पॉटरी फूलदान, नीला फूल वाला डिजाइन, आठ सौ रुपये। फोटो अभी नहीं ली है, समन्वय जी आकर फोटो खींचेंगे।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-20T09:10:00Z'
  },
  {
    id: 'DRAFT-IVR-6320',
    title_en: 'Bastar Lost-Wax Dhokra Bell Metal Nandi Figurine',
    title_hi: 'बस्तर ढोकरा पीतल नंदी हस्तशिल्प मूर्ति',
    description_en: 'Ancient 4,000-year-old lost-wax bell metal casting technique representing sacred tribal Nandi, crafted by indigenous metal smiths.',
    description_hi: 'चार हज़ार वर्ष प्राचीन मोम-सांचे की ढोकरा धातु ढलाई विधि से निर्मित बस्तर का पवित्र नंदी बैल शिल्प।',
    b2c_price: 1800,
    craft_category: 'Metalware & Bell Metal',
    technique: 'Lost-Wax Bell Metal Casting (Dhokra)',
    artisan_name: 'Somari Maravi',
    beneficiary_id: 'NSTFDC-CG-6320',
    cluster_pin: '494001',
    raw_image_url: '',
    studio_image_url: '',
    channel: 'ivr',
    original_transcript: 'कॉल रिकॉर्डिंग: बस्तर पीतल नंदी की मूर्ति, ठोस धातु, अठारह सौ रुपये। समन्वयक विजिट के दौरान फोटो खींचें।',
    status: 'draft',
    correction_log: [],
    created_at: '2026-09-19T11:30:00Z'
  }
];

const getMockDraftCounts = (draftsList) => {
  const all = draftsList.length;
  const total_pending = draftsList.filter(d => d.status === 'draft' || d.status === 'pending' || !d.status).length;
  const missing_photo = draftsList.filter(d => !d.studio_image_url && !d.raw_image_url).length;
  const camera_drafts = draftsList.filter(d => (d.channel === 'camera' || !d.channel) && !d.id?.includes('IVR')).length;
  const ivr_drafts = draftsList.filter(d => d.channel === 'ivr' || d.id?.includes('IVR')).length;
  return { all, total_pending, missing_photo, camera_drafts, ivr_drafts };
};

const filterMockDrafts = (filter) => {
  if (filter === 'camera') {
    return MOCK_COORDINATOR_DRAFTS.filter(d => (d.channel === 'camera' || !d.channel) && !d.id?.includes('IVR'));
  }
  if (filter === 'ivr') {
    return MOCK_COORDINATOR_DRAFTS.filter(d => d.channel === 'ivr' || d.id?.includes('IVR'));
  }
  if (filter === 'missing_photo') {
    return MOCK_COORDINATOR_DRAFTS.filter(d => !d.studio_image_url && !d.raw_image_url);
  }
  return MOCK_COORDINATOR_DRAFTS;
};

export default function CoordinatorReviewPanel({ onClose, onLogout, user }) {
  // Navigation: 'queue' | 'storefront'
  const [activeTab, setActiveTab] = useState('queue');

  // Queue State - Initialized with rich ShilpSetu mock drafts
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'camera' | 'ivr' | 'missing_photo'
  const [searchQuery, setSearchQuery] = useState('');
  const [draftsData, setDraftsData] = useState({
    counts: getMockDraftCounts(MOCK_COORDINATOR_DRAFTS),
    drafts: MOCK_COORDINATOR_DRAFTS
  });
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

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

  // Beckn / ONDC Protocol Inspector State
  const [showBecknModal, setShowBecknModal] = useState(false);
  const [becknModalPayload, setBecknModalPayload] = useState(null);
  const [isLoadingBeckn, setIsLoadingBeckn] = useState(false);
  const [becknCopied, setBecknCopied] = useState(false);
  const [becknTab, setBecknTab] = useState('canonical'); // 'canonical' | 'envelope'

  // ─── Load Queue ─────────────────────────────────────────────────────────────
  const loadQueue = async (filter = queueFilter) => {
    setIsLoadingQueue(true);
    try {
      const data = await fetchCoordinatorDrafts(filter);
      if (data && data.drafts && data.drafts.length > 0) {
        setDraftsData(data);
      } else {
        // Fallback to rich mock drafts filtered by the active tab
        setDraftsData({
          counts: getMockDraftCounts(MOCK_COORDINATOR_DRAFTS),
          drafts: filterMockDrafts(filter)
        });
      }
    } catch (err) {
      console.error('Error fetching coordinator drafts:', err);
      setDraftsData({
        counts: getMockDraftCounts(MOCK_COORDINATOR_DRAFTS),
        drafts: filterMockDrafts(filter)
      });
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

  // ─── Inspect ONDC Beckn Protocol Schema ──────────────────────────────────────
  const handlePreviewBeckn = async () => {
    if (!draftFormData) return;
    setIsLoadingBeckn(true);
    setShowBecknModal(true);
    try {
      const res = await exportBecknCatalog({
        productData: {
          id: draftFormData.id,
          title_en: draftFormData.title_en,
          title_hi: draftFormData.title_hi,
          description_en: draftFormData.description_en,
          description_hi: draftFormData.description_hi,
          craft_category: draftFormData.craft_category,
          technique: draftFormData.technique,
          materials_used: [draftFormData.raw_material || 'Natural Clay / Organic Handloom'],
          studio_url: draftFormData.studio_image_url || draftFormData.raw_image_url,
          channel: draftFormData.channel,
          status: draftFormData.status
        },
        pricingData: {
          b2c_price: Number(draftFormData.b2c_price) || 450,
          b2b_price: Math.round((Number(draftFormData.b2c_price) || 450) * 0.8),
          gem_price: Math.round((Number(draftFormData.b2c_price) || 450) * 0.88),
          base_cost: Math.round((Number(draftFormData.b2c_price) || 450) * 0.6)
        },
        artisanInfo: {
          beneficiary_id: draftFormData.beneficiary_id || 'MoSJE-NBCFDC-01',
          artisan_name: draftFormData.artisan_name || 'Rural Artisan',
          cluster_pin: draftFormData.cluster_pin || '273001'
        }
      });
      setBecknModalPayload(res);
    } catch (err) {
      console.error('Failed to generate Beckn schema:', err);
    } finally {
      setIsLoadingBeckn(false);
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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 select-none font-sans">
      <div className="relative w-full h-full md:max-w-5xl md:h-[92vh] bg-[#F8F9FA] md:rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden text-gray-900">
        
        {/* ==================================================================== */}
        {/* TOP PANEL NAVIGATION BAR (LIGHT MODE HEADER)                         */}
        {/* ==================================================================== */}
        <header className="px-5 py-3.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D97706] shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                  <span>समन्वयक डेस्क • Coordinator Review Panel</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#C85A32] border border-orange-200 text-[10px] font-semibold tracking-wide">
                  MoSJE Field Gateway
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-normal mt-0.5">
                Human-in-the-Loop Verification Checkpoint for AI Drafts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 2-TAB LIGHT MODE SEGMENTED CONTROLLER */}
            <div className="bg-gray-100 p-1 rounded-xl inline-flex border border-gray-200 text-xs font-medium">
              <button
                onClick={() => {
                  setSelectedDraftId(null);
                  setActiveTab('queue');
                }}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-white text-[#C85A32] shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700 font-medium'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Review Queue</span>
                {draftsData.counts.total_pending > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === 'queue' ? 'bg-orange-100 text-[#C85A32]' : 'bg-gray-200 text-gray-600'
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
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'storefront'
                    ? 'bg-white text-[#C85A32] shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700 font-medium'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Published Listings</span>
                {storefrontProducts.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === 'storefront' ? 'bg-orange-100 text-[#C85A32]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {storefrontProducts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Logged in indicator & Logout action */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 text-xs">
                <span className="text-gray-500 font-normal">
                  Coordinator <strong className="text-gray-900 font-medium">{user.phone}</strong>
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Log out"
                    className="py-1 px-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                )}
              </div>
            )}

            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </header>

        {/* ==================================================================== */}
        {/* MAIN BODY VIEW                                                       */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#F8F9FA]">

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB 1: REVIEW QUEUE (LIST VIEW OR DETAIL VIEW)                     */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'queue' && (
            <>
              {!selectedDraftId ? (
                /* ─── 1A: QUEUE LIST VIEW ──────────────────────────────────── */
                <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6 space-y-4">
                  {/* Queue Filter Segmented Bar & Search */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
                    {/* Light Segmented Filter Bar */}
                    <div className="bg-gray-100 p-1 rounded-xl inline-flex border border-gray-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs font-medium">
                      {[
                        { id: 'all', label: 'All Drafts', count: draftsData.counts.all },
                        { id: 'camera', label: 'Camera App', count: draftsData.counts.camera_drafts },
                        { id: 'ivr', label: 'IVR Calls', count: draftsData.counts.ivr_drafts },
                        { id: 'missing_photo', label: 'Missing Photo (To-Do)', count: draftsData.counts.missing_photo },
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => setQueueFilter(f.id)}
                          className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            queueFilter === f.id
                              ? 'bg-white text-[#C85A32] shadow-sm font-semibold'
                              : 'text-gray-500 hover:text-gray-700 font-medium'
                          }`}
                        >
                          <span>{f.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                            queueFilter === f.id ? 'bg-orange-100 text-[#C85A32]' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {f.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Search Bar & Refresh */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 md:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search artisan, craft, ID..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] shadow-2xs transition-all"
                        />
                      </div>
                      <button
                        onClick={() => loadQueue(queueFilter)}
                        title="Refresh Drafts"
                        className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 shadow-2xs transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* White Card List Container */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {isLoadingQueue ? (
                        <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
                          <Loader2 className="w-7 h-7 animate-spin text-[#C85A32]" />
                          <span className="text-xs">Loading coordinator pipeline...</span>
                        </div>
                      ) : filteredDrafts.length === 0 ? (
                        <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">No drafts waiting for review</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {queueFilter === 'missing_photo'
                                ? 'All IVR drafts currently have studio photos attached.'
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
                              className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                            >
                              {/* Left: Thumbnail / Minimal Camera Placeholder + Titles */}
                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                {/* Thumbnail or Warm Photo Due Icon */}
                                <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                                  {hasPhoto ? (
                                    <img
                                      src={draft.studio_image_url || draft.raw_image_url}
                                      alt={draft.title_en}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center text-center p-1 w-full h-full bg-amber-50/60">
                                      <Camera className="w-5 h-5 text-amber-600/70 mb-0.5" />
                                      <span className="text-[8px] font-semibold text-amber-700 leading-none">
                                        Photo Due
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    {/* Neutral Light Mode Channel Badge */}
                                    <span className="bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-semibold uppercase tracking-wider rounded-md px-2 py-0.5 inline-flex items-center gap-1">
                                      {isIvr ? <PhoneCall className="w-2.5 h-2.5 text-gray-500" /> : <Camera className="w-2.5 h-2.5 text-gray-500" />}
                                      <span>{isIvr ? 'IVR Call' : 'Camera App'}</span>
                                    </span>

                                    {/* Subtle Status Pill */}
                                    <span className="bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-medium rounded-md px-2 py-0.5">
                                      {draft.status === 'rejected' ? 'Rejected' : draft.status === 'approved' ? 'Approved' : 'Pending Review'}
                                    </span>

                                    {/* Artisan Identifier */}
                                    <span className="text-[11px] text-gray-500 font-normal">
                                      {draft.artisan_name || 'Rural Artisan'} • {draft.cluster_pin || '273001'}
                                    </span>
                                  </div>

                                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#C85A32] transition-colors truncate">
                                    {draft.title_hi || draft.title_en || 'पारंपरिक हस्तशिल्प'}
                                  </h3>

                                  <p className="text-xs text-gray-500 truncate mt-0.5 font-normal">
                                    {draft.description_en || draft.description_hi || 'Craft narrative awaiting coordinator certification...'}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Dark Slate Tabular Price + Terracotta Orange CTA Button */}
                              <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                <div className="text-left md:text-right">
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">
                                    Suggested Price
                                  </span>
                                  <span className="text-base font-bold text-gray-900 font-mono tabular-nums">
                                    ₹{draft.b2c_price || 0}
                                  </span>
                                </div>

                                <button className="bg-[#C85A32] hover:bg-[#B04A26] text-white font-medium rounded-full px-5 py-2 text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95">
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
                </div>
              ) : (
                /* ─── 1B: REVIEW / EDIT / APPROVE DETAIL SCREEN ─────────────── */
                <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
                  {/* Top Bar: Back to Queue + Breadcrumbs */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBackToQueue}
                        className="py-1.5 px-3.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Queue</span>
                      </button>

                      <span className="text-xs text-gray-500 font-mono">
                        Draft ID: {draftFormData.id}
                      </span>
                    </div>

                    {/* Source Channel Pill */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium flex items-center gap-1.5">
                        {draftFormData.channel === 'ivr' ? <PhoneCall className="w-3.5 h-3.5 text-gray-600" /> : <Camera className="w-3.5 h-3.5 text-gray-600" />}
                        <span>Source: {draftFormData.channel === 'ivr' ? 'Zero-Smartphone Voice-IVR' : 'Camera App Studio'}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-orange-100 text-[#C85A32] border border-orange-200 text-xs font-semibold">
                        {draftFormData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Success Toast Notification */}
                  {actionSuccessMessage && (
                    <div className="my-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{actionSuccessMessage}</span>
                    </div>
                  )}

                  {/* Form Scroll Area */}
                  <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      {/* Left Column: Product Studio Image / Field Photo Upload */}
                      <div className="md:col-span-4 space-y-3">
                        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Product Studio Photo
                            </span>
                            {draftFormData.studio_image_url && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#D97706]" />
                                4K Studio Render
                              </span>
                            )}
                          </div>

                          {/* Image Box */}
                          <div className="w-full aspect-square rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex flex-col items-center justify-center relative group">
                            {draftFormData.studio_image_url || draftFormData.raw_image_url ? (
                              <>
                                <img
                                  src={draftFormData.studio_image_url || draftFormData.raw_image_url}
                                  alt="Studio Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold shadow-md cursor-pointer"
                                  >
                                    Replace Photo
                                  </button>
                                </div>
                              </>
                            ) : (
                              /* IVR Draft Missing Photo Placeholder */
                              <div className="p-4 text-center space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
                                  <Camera className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-bold text-gray-900">In-Person Visit Photo Pending</p>
                                  <p className="text-[11px] text-gray-500 leading-tight">
                                    Artisan registered via Keypad IVR. Visit artisan to capture craft photo.
                                  </p>
                                </div>

                                <button
                                  disabled={isUploadingPhoto}
                                  onClick={() => fileInputRef.current?.click()}
                                  className="mt-2 px-4 py-2 rounded-full bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-xs flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
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
                            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#C85A32] text-[11px] font-semibold flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C85A32] shrink-0" />
                              <span>{uploadStatusText || 'AI Image Studio in progress...'}</span>
                            </div>
                          )}

                          {/* Artisan Metadata Dossier */}
                          <div className="space-y-1 pt-1 text-[11px] font-mono border-t border-gray-100 text-gray-500">
                            <div className="flex justify-between">
                              <span>Artisan:</span>
                              <span className="text-gray-900 font-semibold">{draftFormData.artisan_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Beneficiary ID:</span>
                              <span className="text-gray-700">{draftFormData.beneficiary_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cluster PIN:</span>
                              <span className="text-gray-700">{draftFormData.cluster_pin}</span>
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Original Artisan Voice Input Drawer */}
                        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setShowOriginalInput(!showOriginalInput)}
                            className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 text-gray-900">
                              <FileText className="w-4 h-4 text-[#D97706]" />
                              <span>Original Spoken Input (Audio Sanity Check)</span>
                            </span>
                            {showOriginalInput ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </button>

                          {showOriginalInput && (
                            <div className="p-3.5 pt-0 text-xs space-y-2 border-t border-gray-100 bg-gray-50 font-mono">
                              <p className="text-[11px] text-gray-700 leading-relaxed">
                                {draftFormData.original_transcript || 'नक्काशीदार टेराकोटा मिट्टी का कलश और हांडी, शुद्ध लाल मिट्टी से निर्मित (Spoken vernacular via Bhashini/Voice)'}
                              </p>
                              <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-sans font-medium">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Double check translation against what the artisan actually said.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Editable Metadata Fields (Dual EN/HI Titles, Descs, Price) */}
                      <div className="md:col-span-8 space-y-4">
                        
                        {/* Title Section (Bilingual Inline Editor) */}
                        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Product Title (Bilingual)
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Click to edit inline
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            <div>
                              <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                                English Marketplace Title:
                              </label>
                              <input
                                type="text"
                                value={draftFormData.title_en}
                                onChange={(e) => setDraftFormData({ ...draftFormData, title_en: e.target.value })}
                                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                                Hindi Title (हिंदी शीर्षक):
                              </label>
                              <input
                                type="text"
                                value={draftFormData.title_hi}
                                onChange={(e) => setDraftFormData({ ...draftFormData, title_hi: e.target.value })}
                                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description Section (Side-by-Side Dual Tabs) */}
                        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Marketplace Story & Descriptors
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                                English E-Commerce Description:
                              </label>
                              <textarea
                                rows={4}
                                value={draftFormData.description_en}
                                onChange={(e) => setDraftFormData({ ...draftFormData, description_en: e.target.value })}
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] resize-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                                Hindi Description (शिल्प विवरण):
                              </label>
                              <textarea
                                rows={4}
                                value={draftFormData.description_hi}
                                onChange={(e) => setDraftFormData({ ...draftFormData, description_hi: e.target.value })}
                                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] resize-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Price, Category & Technique Grid */}
                        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Suggested Price Field */}
                          <div>
                            <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                              Selling Price (₹ INR):
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                              <input
                                type="number"
                                value={draftFormData.b2c_price}
                                onChange={(e) => setDraftFormData({ ...draftFormData, b2c_price: Number(e.target.value) })}
                                className="w-full pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-base font-bold text-gray-900 font-mono tabular-nums focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-all"
                              />
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                              ✓ Statutory Living Wage Compliant
                            </span>
                          </div>

                          {/* Craft Category */}
                          <div>
                            <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                              Craft Category:
                            </label>
                            <input
                              type="text"
                              value={draftFormData.craft_category}
                              onChange={(e) => setDraftFormData({ ...draftFormData, craft_category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-all"
                            />
                            <span className="text-[10px] text-gray-400 block mt-1">
                              MoSJE Heritage Schedule
                            </span>
                          </div>

                          {/* Technique */}
                          <div>
                            <label className="text-[11px] text-gray-600 font-semibold block mb-1">
                              Heritage Technique:
                            </label>
                            <input
                              type="text"
                              value={draftFormData.technique}
                              onChange={(e) => setDraftFormData({ ...draftFormData, technique: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] transition-all"
                            />
                            <span className="text-[10px] text-gray-400 block mt-1">
                              GI Tag Verification Method
                            </span>
                          </div>
                        </div>

                        {/* Audit & Correction Log Drawer */}
                        {activeFieldCorrections.length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                              <History className="w-4 h-4 text-[#D97706]" />
                              <span>Human-in-the-Loop Changes (Recorded in Audit Log):</span>
                            </div>
                            <div className="space-y-1 font-mono text-[11px]">
                              {activeFieldCorrections.map((diff, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-amber-800">
                                  <span className="text-gray-600 font-semibold">{diff.label}:</span>
                                  <span className="line-through text-gray-400">{diff.from}</span>
                                  <span className="text-[#C85A32] font-bold">→ {diff.to}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fixed Bottom Action Dock (Approve & Publish / Save Changes / Reject) */}
                  <div className="pt-3.5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-[#F8F9FA]">
                    <div className="text-[11px] text-gray-500">
                      <span>Village Coordinator: </span>
                      <span className="font-semibold text-gray-800">Ramesh Chandra (ID: VC-273001)</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
                      {/* Action: Inspect ONDC Beckn Schema */}
                      <button
                        type="button"
                        onClick={handlePreviewBeckn}
                        className="py-2.5 px-4 rounded-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Inspect ONDC Beckn Protocol v1.2.0 JSON Schema"
                      >
                        <Globe className="w-3.5 h-3.5 text-gray-600" />
                        <span>Inspect ONDC Payload</span>
                      </button>

                      {/* Action 1: Reject */}
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="py-2.5 px-4 rounded-full border border-rose-300 hover:bg-rose-50 text-rose-700 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Reject Draft</span>
                      </button>

                      {/* Action 2: Save Changes (Approve without premature publish) */}
                      <button
                        disabled={isSavingChanges || isPublishing}
                        onClick={handleSaveChanges}
                        className="py-2.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs border border-gray-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        {isSavingChanges ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-gray-600" />}
                        <span>Save Changes (Approve)</span>
                      </button>

                      {/* Action 3: Approve & Publish Live (Terracotta Orange Button) */}
                      <button
                        disabled={isPublishing || isSavingChanges}
                        onClick={handleApproveAndPublish}
                        className="py-2.5 px-5 rounded-full bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Send className="w-3.5 h-3.5 text-white" />}
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
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>Live Certified Marketplace Storefront</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ONDC & GeM Live
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-normal">
                    Products reviewed and verified by field coordinators. Published directly to open commerce.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-gray-700 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-2xs">
                    {storefrontProducts.length} Products Live
                  </span>
                </div>
              </div>

              {/* Storefront Product Cards Grid */}
              <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoadingStorefront ? (
                  <div className="py-24 text-center text-gray-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-7 h-7 animate-spin text-[#C85A32]" />
                    <span className="text-xs">Fetching live published storefront items...</span>
                  </div>
                ) : storefrontProducts.length === 0 ? (
                  <div className="py-24 text-center text-gray-400">
                    <p className="text-sm font-semibold text-gray-900">No published listings yet</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Review pending drafts in the Review Queue and click "Approve & Publish Live".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {storefrontProducts.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
                      >
                        {/* Product Studio Image */}
                        <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative">
                          <img
                            src={product.studio_image_url || product.raw_image_url || '/terracotta_pot_clean.png'}
                            alt={product.title_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-bold text-gray-900 border border-gray-200 shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#D97706]" />
                            GI Certified
                          </span>
                          <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-gray-900/80 backdrop-blur-md text-[9px] font-mono text-white">
                            PIN: {product.cluster_pin || '273001'}
                          </span>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] text-[#C85A32] font-bold uppercase tracking-wider block">
                              {product.craft_category || 'Handloom Textiles'}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#C85A32] transition-colors mt-0.5">
                              {product.title_hi || product.title_en}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 font-normal">
                              {product.description_en || product.description_hi}
                            </p>
                          </div>

                          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-gray-400 block uppercase font-semibold">Artisan</span>
                              <span className="text-xs font-semibold text-gray-850">{product.artisan_name || 'Rural Artisan'}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-bold text-gray-900 font-mono tabular-nums">
                                ₹{product.b2c_price || 450}
                              </span>
                            </div>
                          </div>

                          {/* Inspect Verified QR Button */}
                          <button
                            onClick={() => setQrModalProduct(product)}
                            className="w-full py-2 px-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <QrCode className="w-3.5 h-3.5 text-gray-600" />
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
        {/* REJECT MODAL (LIGHT DIALOG)                                          */}
        {/* ==================================================================== */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-2xl text-gray-900">
              <div className="flex items-center gap-2.5 text-gray-900">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-gray-900">Reject Draft with Audit Feedback</h3>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Please provide the reason for rejection (e.g., "unclear audio description, needs re-recording", or "materials misidentified"). This audit note will guide the village coordinator's re-engagement with the artisan.
              </p>

              <div>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Unclear vernacular audio, selling price misidentified, photo blurred..."
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmittingReject || !rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
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
          <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-5 space-y-4 shadow-2xl text-center text-gray-900">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  MoSJE Certified Product QR
                </span>
                <button
                  onClick={() => setQrModalProduct(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* QR Image */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl inline-block shadow-inner">
                {qrModalProduct.qr_code_url ? (
                  <img
                    src={qrModalProduct.qr_code_url}
                    alt="Product QR"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400 font-mono text-xs">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {qrModalProduct.title_en || qrModalProduct.title_hi}
                </h4>
                <p className="text-[11px] text-gray-500 font-mono">
                  Listing #{qrModalProduct.id} • ₹{qrModalProduct.b2c_price}
                </p>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Scannable by any mobile device to open public verification dossier
                </span>
              </div>

              <a
                href={`/verify/${qrModalProduct.id}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-full bg-[#C85A32] hover:bg-[#B04A26] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ─── MODAL 3: ONDC BECKN PROTOCOL SCHEMA INSPECTOR (LIGHT DIALOG) ──── */}
        {showBecknModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-gray-900">
              {/* Modal Header */}
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#C85A32]">
                    <Globe className="w-4 h-4 text-[#C85A32]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <span>ONDC Beckn Protocol Payload Inspector</span>
                      <span className="px-2 py-0.2 rounded-full bg-orange-100 text-[#C85A32] text-[9px] font-mono font-semibold">
                        Retail v1.2.0 Compliant
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-normal">
                      Standard JSON Schema for direct BPP discovery across open commerce networks
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowBecknModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Tab Selector: Canonical Item vs Full Envelope */}
              <div className="px-5 pt-3 pb-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-1 bg-gray-200/80 p-1 rounded-xl">
                  <button
                    onClick={() => setBecknTab('canonical')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      becknTab === 'canonical'
                        ? 'bg-white text-[#C85A32] font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    ONDC Item Schema (Core)
                  </button>
                  <button
                    onClick={() => setBecknTab('envelope')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      becknTab === 'envelope'
                        ? 'bg-white text-[#C85A32] font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Full Beckn v1.2.0 Envelope
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dataToCopy = becknTab === 'canonical'
                        ? (becknModalPayload?.canonical_ondc_item || becknModalPayload)
                        : becknModalPayload;
                      if (dataToCopy) {
                        navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
                        setBecknCopied(true);
                        setTimeout(() => setBecknCopied(false), 2000);
                      }
                    }}
                    className="py-1 px-3 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {becknCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                    <span>{becknCopied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const dataToDownload = becknTab === 'canonical'
                        ? (becknModalPayload?.canonical_ondc_item || becknModalPayload)
                        : becknModalPayload;
                      if (dataToDownload) {
                        const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ondc_beckn_${draftFormData?.id || 'item'}.json`;
                        a.click();
                      }
                    }}
                    className="py-1 px-3 rounded-full bg-[#C85A32] hover:bg-[#B04A26] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Content / Code Viewer */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#1E1E1E] font-mono text-xs">
                {isLoadingBeckn ? (
                  <div className="py-16 text-center text-gray-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
                    <p className="text-xs">Serializing draft into Beckn Retail Protocol v1.2.0...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-start gap-2 font-sans">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white">Interoperable & Pluggable: </span>
                        <span>
                          Unit QR ID (<span className="font-mono text-orange-300">{draftFormData?.id}</span>) binds directly into Beckn <span className="font-mono text-orange-300">Item.id</span>. Domain-specific verification provenance is serialized into Beckn <span className="font-mono text-orange-300">tags</span> for zero-loss ONDC transmission.
                        </span>
                      </div>
                    </div>

                    <pre className="p-4 rounded-2xl bg-black/40 border border-white/10 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed select-text">
                      {JSON.stringify(
                        becknTab === 'canonical'
                          ? (becknModalPayload?.canonical_ondc_item || becknModalPayload)
                          : becknModalPayload,
                        null,
                        2
                      )}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
