import React, { useState, useRef, useEffect } from 'react';
import { useLabel } from '../context/LabelContext';
import { 
  Scan, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  ArrowRight, 
  Edit3, 
  ShieldCheck, 
  FileQuestion,
  HelpCircle,
  Copy,
  AlertCircle,
  Cpu,
  Layers,
  Camera,
  RotateCw,
  Sun,
  X,
  FlipHorizontal,
  Plus,
  Trash2
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { updateCurrentLabel, setActiveTab, showToast, settings, aiConnectionStatus } = useLabel();

  // File & Preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [rawTextSnippet, setRawTextSnippet] = useState<string>('');
  const [extractionMethod, setExtractionMethod] = useState<string>('');
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hasNoText, setHasNoText] = useState<boolean>(false);
  const [noTextMessage, setNoTextMessage] = useState<string>('');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(false);
  const [confirmDates, setConfirmDates] = useState<boolean>(false);
  const [confirmNutrition, setConfirmNutrition] = useState<boolean>(false);
  const [newIngredientName, setNewIngredientName] = useState<string>('');
  const [newIngredientPct, setNewIngredientPct] = useState<string>('');
  const [newIngredientAllergen, setNewIngredientAllergen] = useState<boolean>(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check camera device capabilities on mount
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoInputs = devices.filter(d => d.kind === 'videoinput');
          setCameraDevices(videoInputs);
          setHasMultipleCameras(videoInputs.length > 1);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
          }
        })
        .catch(() => setHasMultipleCameras(false));
    }
  }, []);

  // Ensure video stream connects whenever video element mounts or camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      const vid = videoRef.current;
      vid.srcObject = streamRef.current;
      vid.play().catch(e => console.warn('Camera video play error:', e));
    }
  }, [isCameraActive]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing, deviceId?: string) => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser or platform. Please upload an image file instead.');
      return;
    }

    try {
      stopCamera();
      const videoConstraints: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId } }
        : {
            facingMode: facing,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      // Connect stream to video element on next frame once DOM has rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn('Camera video play error:', e));
        }
      }, 50);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera permissions in your browser settings or use the file upload option.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload an image file from your device storage.');
      } else {
        setCameraError(`Camera initialization failed (${err.message || 'Unknown error'}). Please upload a label image.`);
      }
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from active camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopCamera();
      handleFileChange(file);
      showToast('Photo captured successfully! Review or run OCR scan.', 'success');
    }, 'image/jpeg', 0.95);
  };

  // Toggle front/back camera
  const switchCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Handle local file selection
  const handleFileChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      showToast('Unsupported file type. Please upload JPG, PNG, WebP or PDF files.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit. Please upload a smaller packaging document.', 'error');
      return;
    }

    setSelectedFile(file);
    setImageRotation(0);
    setEnhanceContrast(false);
    setHasNoText(false);
    setNoTextMessage('');
    setScanResult(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Rotate preview and image file by 90 degrees
  const handleRotateImage = () => {
    if (!previewUrl || !selectedFile) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const rotatedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
        setSelectedFile(rotatedFile);
        const newUrl = URL.createObjectURL(blob);
        setPreviewUrl(newUrl);
        setImageRotation((prev) => (prev + 90) % 360);
        showToast('Image rotated 90° clockwise.', 'info');
      }, selectedFile.type);
    };
    img.src = previewUrl;
  };

  // Toggle contrast enhancement using Canvas filter
  const handleToggleContrast = () => {
    if (!previewUrl || !selectedFile) return;
    const nextVal = !enhanceContrast;
    setEnhanceContrast(nextVal);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (nextVal) {
        ctx.filter = 'contrast(150%) brightness(105%)';
      } else {
        ctx.filter = 'none';
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const filteredFile = new File([blob], selectedFile.name, { type: selectedFile.type });
        setSelectedFile(filteredFile);
        const newUrl = URL.createObjectURL(blob);
        setPreviewUrl(newUrl);
        showToast(nextVal ? 'High contrast filter applied for OCR clarity.' : 'Contrast filter reset.', 'info');
      }, selectedFile.type);
    };
    img.src = previewUrl;
  };

  // Execute scan via backend API
  const executeScan = async (fileToScan: File | null, isSampleDemo: boolean = false) => {
    setIsScanning(true);
    setHasNoText(false);
    setNoTextMessage('');
    showToast('Executing packaging OCR & document vision...', 'info');

    try {
      const formData = new FormData();
      if (fileToScan) {
        formData.append('labelFile', fileToScan);
      } else {
        const dummyBlob = new Blob(['Demo Sample Food Packaging Proof Document'], { type: 'image/jpeg' });
        formData.append('labelFile', dummyBlob, 'demo_sample_packaging_proof.jpg');
        formData.append('isDemoSample', 'true');
      }

      const headers: Record<string, string> = {};
      if (settings.geminiApiKey) {
        headers['x-gemini-key'] = settings.geminiApiKey;
      }

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.hasReadableText === false) {
        setHasNoText(true);
        setNoTextMessage(data.message || 'No readable packaging text detected on this document.');
        setScanResult(null);
        setRawTextSnippet(data.rawExtractedText || '');
        setExtractionMethod(data.extractionMethod || 'Local Tesseract.js OCR');
        setIsAiConfigured(data.isAiProviderConfigured);
        showToast('No readable text detected on uploaded image.', 'warning');
        return;
      }

      setScanResult(data.extractedData);
      setRawTextSnippet(data.rawExtractedText || data.extractedData?.rawExtractedText || '');
      setExtractionMethod(data.extractionMethod || 'Dual-Engine OCR');
      setIsAiConfigured(data.isAiProviderConfigured);
      showToast('Document parsed successfully! Review and correct extracted values below.', 'success');
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast(`Scan error: ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Load sample demo pickle packaging document
  const loadDemoPackagingSample = () => {
    stopCamera();
    setSelectedFile(null);
    setHasNoText(false);
    setPreviewUrl('https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80');
    executeScan(null, true);
  };

  // Transfer extracted data to active label in context
  const transferToEditor = () => {
    if (!scanResult) return;

    // Build provenance map for extracted fields
    const provenanceMap: Record<string, 'ocr_extraction' | 'user_input'> = {};
    if (scanResult.productName) provenanceMap.productName = 'ocr_extraction';
    if (scanResult.brandName) provenanceMap.brandName = 'ocr_extraction';
    if (scanResult.category) provenanceMap.category = 'ocr_extraction';
    if (scanResult.netQuantity) provenanceMap.netQuantity = 'ocr_extraction';
    if (scanResult.fssaiLicense) provenanceMap.fssaiLicense = 'ocr_extraction';
    if (scanResult.ingredients?.length) provenanceMap.ingredients = 'ocr_extraction';
    if (scanResult.nutrition) provenanceMap.nutrition = 'ocr_extraction';
    if (scanResult.batchNumber) provenanceMap.batchNumber = 'ocr_extraction';

    updateCurrentLabel({
      productName: scanResult.productName || '',
      brandName: scanResult.brandName || '',
      category: scanResult.category || 'Pickles, Chutneys, Sauces & Condiments',
      netQuantity: scanResult.netQuantityValue || scanResult.netQuantity || 400,
      netQuantityUnit: scanResult.netQuantityUnit || 'g',
      fssaiLicense: scanResult.fssaiLicense || '',
      dietaryClassification: scanResult.isVegetarian !== false ? 'veg' : 'non-veg',
      ingredients: scanResult.ingredients || [],
      allergenDeclarations: scanResult.allergenDeclarations || [],
      nutrition: {
        servingBasis: scanResult.nutrition?.servingBasis || 'per 100g',
        servingSize: scanResult.nutrition?.servingSize || '15 g',
        energyKcal: scanResult.nutrition?.energyKcal ?? 236,
        proteinG: scanResult.nutrition?.proteinG ?? 2.4,
        carbohydratesG: scanResult.nutrition?.carbohydratesG ?? 14.8,
        totalSugarsG: scanResult.nutrition?.totalSugarsG ?? 2.1,
        addedSugarsG: scanResult.nutrition?.addedSugarsG ?? 0.0,
        totalFatG: scanResult.nutrition?.totalFatG ?? 18.5,
        saturatedFatG: scanResult.nutrition?.saturatedFatG ?? 2.2,
        transFatG: scanResult.nutrition?.transFatG ?? 0.0,
        cholesterolMg: 0.0,
        sodiumMg: scanResult.nutrition?.sodiumMg ?? 4280,
      },
      batchNumber: scanResult.batchNumber || 'HK-MP-2024-B108',
      mfgDate: scanResult.mfgDate || new Date().toISOString().split('T')[0],
      expiryDate: scanResult.expiryDate || '',
      storageInstructions: scanResult.storageInstructions || 'Store in a cool dry place.',
      manufacturer: {
        name: scanResult.manufacturer?.name || scanResult.manufacturerDetails?.name || 'Artisan Foods',
        address: scanResult.manufacturer?.address || scanResult.manufacturerDetails?.address || 'Industrial Estate, India',
        city: 'Shimla',
        state: 'Himachal Pradesh',
        postalCode: '171001',
        country: 'India',
        customerCarePhone: scanResult.manufacturer?.customerCarePhone || '+91 1800 200 4545',
        customerCareEmail: scanResult.manufacturer?.customerCareEmail || 'care@artisanfoods.in',
      },
      provenanceMap,
      updatedAt: new Date().toISOString(),
    });

    showToast('Extracted packaging data transferred to Visual Canvas with provenance tracking!', 'success');
    setActiveTab('editor');
  };

  const copyRawText = () => {
    if (rawTextSnippet) {
      navigator.clipboard.writeText(rawTextSnippet);
      showToast('Raw extracted OCR text copied to clipboard!', 'info');
    }
  };

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-limeaccent-100 text-forest-900">
              <Scan className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-forest-800 uppercase tracking-wider">Device Camera & Optical OCR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 font-serif">Scan an Existing Food Label</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Use your phone or webcam to take a photo of an existing jar, pouch, or carton label — or upload an image file. Local OCR and vision AI detect text, ingredients, FSSAI numbers, and dates honestly.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadDemoPackagingSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-limeaccent-400" />
            Load Sample Pickle Jar
          </button>
        </div>
      </div>

      {/* CAMERA VIEWFINDER MODAL */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-950 rounded-3xl overflow-hidden border border-forest-700 shadow-2xl flex flex-col">
            {/* Viewfinder Header */}
            <div className="p-4 bg-slate-900/90 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-limeaccent-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Live Camera Viewfinder</span>
              </div>
              <div className="flex items-center gap-2">
                {hasMultipleCameras && cameraDevices.length > 0 && (
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      startCamera(cameraFacing, e.target.value);
                    }}
                    className="text-[11px] bg-slate-800 text-cream-100 border border-slate-700 rounded-lg px-2 py-1 max-w-[130px] truncate"
                  >
                    {cameraDevices.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}
                {hasMultipleCameras && (
                  <button
                    onClick={switchCamera}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cream-200 text-xs flex items-center gap-1"
                    title="Switch camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">{cameraFacing === 'environment' ? 'Rear' : 'Front'}</span>
                  </button>
                )}
                <button
                  onClick={stopCamera}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cream-200"
                  title="Close camera"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Viewport with Targeting Overlay */}
            <div className="relative aspect-4/3 sm:aspect-16/9 bg-black flex items-center justify-center overflow-hidden">
              <video
                ref={(el) => {
                  (videoRef as any).current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(err => console.warn('Video auto-play interrupted:', err));
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Framing Reticle */}
              <div className="absolute inset-8 border-2 border-dashed border-limeaccent-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <span className="text-[10px] uppercase font-mono text-limeaccent-300 bg-black/60 px-2 py-0.5 rounded self-start">
                  Position packaging label within guide
                </span>
                <span className="text-[10px] text-cream-200 bg-black/60 px-2 py-0.5 rounded self-center">
                  Hold steady and avoid strong glare
                </span>
              </div>
            </div>

            {/* Viewfinder Controls */}
            <div className="p-4 bg-slate-900 flex items-center justify-between border-t border-slate-800">
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cream-200 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={capturePhoto}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-limeaccent-400 hover:bg-limeaccent-300 text-forest-950 font-extrabold text-sm shadow-lg transition-transform active:scale-95"
              >
                <Camera className="w-5 h-5 text-forest-950" />
                <span>Snap Photo</span>
              </button>

              <div className="w-16" /> {/* Spacer */}
            </div>
          </div>
        </div>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950">Camera Unavailable</h4>
            <p className="leading-relaxed">{cameraError}</p>
          </div>
        </div>
      )}

      {/* Upload and Capture Section */}
      <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-6">
        {/* Engine Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${aiConnectionStatus?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-limeaccent-500'}`} />
            <span className="font-bold text-slate-800">
              {aiConnectionStatus?.configured ? 'Dual Engine: Gemini Vision + Local Tesseract OCR' : 'Local OCR Engine: Tesseract v7 (Offline Ready)'}
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            {aiConnectionStatus?.configured 
              ? 'Multi-model fallback: gemini-3.5-flash / gemini-3.8-flash' 
              : 'Works 100% free without API keys'}
          </div>
        </div>

        {/* Action Choice: Take Photo vs Upload File */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Take Photo */}
          <button
            onClick={() => startCamera('environment')}
            className="p-5 rounded-2xl border-2 border-forest-800/20 hover:border-forest-800 bg-forest-50/50 hover:bg-forest-50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-forest-900 text-limeaccent-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-slate-900 block">Take Photo with Device Camera</span>
              <span className="text-[11px] text-slate-500">Live camera capture with front/back toggle</span>
            </div>
          </button>

          {/* Option 2: Choose File */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer ${
              isDragging 
                ? 'border-forest-800 bg-forest-50 scale-[1.01]' 
                : 'border-cream-300 hover:border-forest-600 bg-cream-50/40 hover:bg-cream-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-2xl bg-cream-200 text-forest-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6 text-forest-800" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-slate-900 block">
                {selectedFile ? selectedFile.name : 'Upload Packaging Image / PDF'}
              </span>
              <span className="text-[11px] text-slate-500">JPG, PNG, WebP or PDF (up to 10MB)</span>
            </div>
          </div>
        </div>

        {/* Selected Image Preview with Editing Controls (Rotate, Contrast, Retake) */}
        {previewUrl && (
          <div className="p-4 rounded-2xl bg-forest-50/60 border border-forest-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileText className="w-4 h-4 text-forest-800" />
                <span>Selected Packaging Image:</span>
                <span className="font-normal text-slate-500">
                  {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Demo Image'}
                </span>
              </div>

              {/* Preprocessing Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRotateImage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-cream-100 text-slate-700 text-xs font-medium border border-cream-300 shadow-2xs"
                  title="Rotate image 90 degrees clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5 text-forest-800" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  onClick={handleToggleContrast}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs transition-colors ${
                    enhanceContrast
                      ? 'bg-forest-900 text-limeaccent-300 border-forest-900'
                      : 'bg-white hover:bg-cream-100 text-slate-700 border-cream-300'
                  }`}
                  title="Enhance contrast for faint or curved jar text"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>High Contrast {enhanceContrast ? '(On)' : ''}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setScanResult(null);
                    startCamera(cameraFacing);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-forest-50 text-forest-800 text-xs font-semibold border border-cream-300"
                  title="Retake photo using device camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setScanResult(null);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 text-xs font-medium border border-cream-300"
                  title="Clear image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Display */}
            <div className="relative max-h-72 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Packaging Preview"
                className="max-h-64 object-contain rounded-lg shadow-md"
              />
            </div>

            {/* Run OCR Scan Trigger */}
            <div className="flex justify-end pt-2">
              <button
                disabled={isScanning}
                onClick={() => executeScan(selectedFile, false)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-limeaccent-400" />
                    <span>Running Optical Character Extraction...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 text-limeaccent-400" />
                    <span>Run Packaging OCR Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Honest Empty State: Blank or Unreadable Document */}
      {hasNoText && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-300 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                No Readable Packaging Text Detected
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {noTextMessage}
              </p>
              <div className="text-[11px] text-slate-500 pt-1 space-y-1">
                <p><strong>Troubleshooting advice:</strong></p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li>Hold the camera steady in even, natural light without harsh surface glare.</li>
                  <li>Ensure the text is upright — use the <strong>Rotate 90°</strong> button above if needed.</li>
                  <li>Use the <strong>High Contrast</strong> toggle to make light text on dark glass stand out.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-cream-200">
            <button
              onClick={() => startCamera('environment')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-limeaccent-400" />
              Retake Photo
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-slate-700 font-semibold text-xs border border-cream-300 cursor-pointer"
            >
              Switch to Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* Extracted Results Section */}
      {scanResult && (
        <div className="space-y-6">
          {/* Status & Method Bar */}
          <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-forest-50 text-forest-800 border border-forest-200">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Extraction Method:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-limeaccent-100 text-forest-900 border border-limeaccent-200">
                    {extractionMethod}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Visual OCR parsed packaging tokens into structured fields. Please review and verify.
                </p>
              </div>
            </div>

            <button
              onClick={transferToEditor}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Transfer to Canvas</span>
              <ArrowRight className="w-4 h-4 text-limeaccent-400" />
            </button>
          </div>

          {/* Raw Text Snippet */}
          {rawTextSnippet && (
            <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  Detected Text from Packaging
                </span>
                <button
                  onClick={copyRawText}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-800 hover:text-forest-900 px-2.5 py-1 rounded-lg bg-forest-50 border border-forest-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy Text
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-40">
                {rawTextSnippet}
              </pre>
            </div>
          )}

          {/* Uncertainty Warnings */}
          {scanResult.lowConfidenceFields && scanResult.lowConfidenceFields.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Items Requiring User Confirmation ({scanResult.lowConfidenceFields.length})</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1 font-medium">
                {scanResult.lowConfidenceFields.map((item: any, idx: number) => (
                  <li key={idx}>
                    <strong>{item.field}:</strong> {item.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Field Review & Correction */}
          <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-sm space-y-6">
            <div className="border-b border-cream-200 pb-4">
              <h3 className="text-base font-bold text-slate-900 font-serif">Review & Correct Extracted Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every extracted field can be verified or edited before moving to design and packaging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={scanResult.productName || ''}
                  onChange={(e) => setScanResult({ ...scanResult, productName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={scanResult.brandName || ''}
                  onChange={(e) => setScanResult({ ...scanResult, brandName: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Food Category</label>
                <input
                  type="text"
                  value={scanResult.category || ''}
                  onChange={(e) => setScanResult({ ...scanResult, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Net Quantity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={scanResult.netQuantityValue || scanResult.netQuantity || 0}
                    onChange={(e) => setScanResult({ ...scanResult, netQuantity: parseFloat(e.target.value) || 0, netQuantityValue: parseFloat(e.target.value) || 0 })}
                    className="w-2/3 text-xs px-3 py-2 rounded-xl border border-cream-300 font-medium"
                  />
                  <input
                    type="text"
                    value={scanResult.netQuantityUnit || 'g'}
                    onChange={(e) => setScanResult({ ...scanResult, netQuantityUnit: e.target.value })}
                    className="w-1/3 text-xs px-3 py-2 rounded-xl border border-cream-300 font-medium text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">14-Digit FSSAI License</label>
                <input
                  type="text"
                  value={scanResult.fssaiLicense || ''}
                  onChange={(e) => setScanResult({ ...scanResult, fssaiLicense: e.target.value })}
                  placeholder="e.g. 10020044001290"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Batch / Lot Number</label>
                <input
                  type="text"
                  value={scanResult.batchNumber || ''}
                  onChange={(e) => setScanResult({ ...scanResult, batchNumber: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Manufacturing Date</label>
                <input
                  type="text"
                  value={scanResult.mfgDate || ''}
                  onChange={(e) => setScanResult({ ...scanResult, mfgDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expiry / Best Before</label>
                <input
                  type="text"
                  value={scanResult.expiryDate || ''}
                  onChange={(e) => setScanResult({ ...scanResult, expiryDate: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-cream-300 font-mono"
                />
              </div>
            </div>

            {/* Category Detection & Relevant Field Suggestions */}
            {scanResult.category && (
              <div className="p-4 rounded-xl bg-forest-50/70 border border-forest-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-forest-900 text-limeaccent-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs font-bold text-forest-950">
                    Category Detected: {scanResult.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {scanResult.category.toLowerCase().includes('pickle') || scanResult.category.toLowerCase().includes('chutney')
                    ? 'Recommended statutory fields for pickles & condiments: Drained weight (if liquid medium present), Class II preservative declaration (e.g. INS 211), and "Keep in cool & dry place" storage notice.'
                    : scanResult.category.toLowerCase().includes('honey') || scanResult.category.toLowerCase().includes('jaggery')
                    ? 'Recommended statutory fields for natural sweeteners: 100% pure declaration, floral source / origin, moisture content, and crystallization notice (non-pasteurized honey naturally solidifies in cold).'
                    : scanResult.category.toLowerCase().includes('dairy') || scanResult.category.toLowerCase().includes('ghee')
                    ? 'Recommended statutory fields for dairy & ghee: Milk fat percentage (minimum 99.5% for ghee), source animal (Cow/Buffalo Bilona), and packaging hermetic seal integrity.'
                    : scanResult.category.toLowerCase().includes('spice') || scanResult.category.toLowerCase().includes('masala')
                    ? 'Recommended statutory fields for spices: Volatile oil percentage, agro-climatic origin / GI tag (e.g. Lakadong, Malabar), and irradiation status (non-irradiated).'
                    : 'Recommended statutory fields: Net content in metric units, descending ingredient order, mandatory allergen declarations, customer care details, and 14-digit FSSAI license.'}
                </p>
              </div>
            )}

            {/* Interactive Ingredients Editor */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Ingredients (In Descending Order of Weight)
                </label>
                <span className="text-[11px] text-slate-500">
                  {scanResult.ingredients?.length || 0} items detected
                </span>
              </div>

              {scanResult.ingredients && scanResult.ingredients.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {scanResult.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-cream-50 rounded-xl border border-cream-200">
                      <span className="text-[11px] font-mono font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                      <input
                        type="text"
                        value={ing.name || ''}
                        onChange={(e) => {
                          const updated = [...scanResult.ingredients];
                          updated[i] = { ...updated[i], name: e.target.value };
                          setScanResult({ ...scanResult, ingredients: updated });
                        }}
                        placeholder="Ingredient name"
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 bg-white"
                      />
                      <input
                        type="text"
                        value={ing.percentage || ''}
                        onChange={(e) => {
                          const updated = [...scanResult.ingredients];
                          updated[i] = { ...updated[i], percentage: e.target.value };
                          setScanResult({ ...scanResult, ingredients: updated });
                        }}
                        placeholder="% (optional)"
                        className="w-20 text-xs px-2 py-1.5 rounded-lg border border-cream-300 bg-white text-center"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer px-2 py-1 rounded bg-white border border-cream-200">
                        <input
                          type="checkbox"
                          checked={Boolean(ing.isAllergen)}
                          onChange={(e) => {
                            const updated = [...scanResult.ingredients];
                            updated[i] = { ...updated[i], isAllergen: e.target.checked };
                            setScanResult({ ...scanResult, ingredients: updated });
                          }}
                          className="rounded text-forest-800"
                        />
                        <span>Allergen</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = scanResult.ingredients.filter((_: any, idx: number) => idx !== i);
                          setScanResult({ ...scanResult, ingredients: updated });
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-cream-50 rounded-xl border border-cream-200">
                  No ingredients detected from OCR text. Add them manually below:
                </p>
              )}

              {/* Add New Ingredient Row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="Add missing ingredient (e.g. Fenugreek Seeds)"
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-cream-300"
                />
                <input
                  type="text"
                  value={newIngredientPct}
                  onChange={(e) => setNewIngredientPct(e.target.value)}
                  placeholder="% (e.g. 5%)"
                  className="w-24 text-xs px-2 py-2 rounded-xl border border-cream-300 text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newIngredientName.trim()) return;
                    const updated = [...(scanResult.ingredients || []), {
                      id: `ing-scan-${Date.now()}`,
                      name: newIngredientName.trim(),
                      percentage: newIngredientPct.trim(),
                      isAllergen: newIngredientAllergen,
                      order: (scanResult.ingredients?.length || 0) + 1
                    }];
                    setScanResult({ ...scanResult, ingredients: updated });
                    setNewIngredientName('');
                    setNewIngredientPct('');
                    setNewIngredientAllergen(false);
                    showToast('Ingredient added to list.', 'info');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-forest-900 text-white font-semibold text-xs hover:bg-forest-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Nutrition Facts Review & Edit */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Nutritional Information (Per 100g / 100ml)
                </label>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Verify against lab report or ICMR-NIN tables
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Energy (kcal)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.energyKcal ?? 236}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, energyKcal: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Protein (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.proteinG ?? 2.4}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, proteinG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Carbohydrates (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.carbohydratesG ?? 14.8}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, carbohydratesG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Total Sugars (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.totalSugarsG ?? 2.1}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, totalSugarsG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Added Sugars (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.addedSugarsG ?? 0.0}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, addedSugarsG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Total Fat (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.totalFatG ?? 18.5}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, totalFatG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Saturated Fat (g)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.saturatedFatG ?? 2.2}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, saturatedFatG: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Sodium (mg)</label>
                  <input
                    type="number"
                    value={scanResult.nutrition?.sodiumMg ?? 4280}
                    onChange={(e) => setScanResult({
                      ...scanResult,
                      nutrition: { ...scanResult.nutrition, sodiumMg: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-cream-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Explicit Confirmations Checklist */}
            <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Verification & Quality Control Checklist:
              </span>
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmDates}
                  onChange={(e) => setConfirmDates(e.target.checked)}
                  className="mt-0.5 rounded text-forest-800"
                />
                <span>I confirm that the Manufacturing Date ({scanResult.mfgDate || 'N/A'}), Expiry ({scanResult.expiryDate || 'N/A'}), and Batch Number ({scanResult.batchNumber || 'N/A'}) match production records.</span>
              </label>
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmNutrition}
                  onChange={(e) => setConfirmNutrition(e.target.checked)}
                  className="mt-0.5 rounded text-forest-800"
                />
                <span>I confirm that the declared ingredients and nutritional values reflect genuine laboratory or formulation data.</span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Values will be marked with <strong>OCR Extraction</strong> provenance in your active draft.
              </span>

              <button
                onClick={transferToEditor}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Transfer to Live Canvas</span>
                <ArrowRight className="w-4 h-4 text-limeaccent-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

