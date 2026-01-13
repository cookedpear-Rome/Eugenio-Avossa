
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import { removeTextFromImage } from './services/geminiService';
import { ImageData, ProcessingState } from './types';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    progressMessage: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setState(prev => ({ ...prev, error: 'Please upload a valid image file.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSourceImage({
        base64,
        mimeType: file.type,
        name: file.name,
      });
      setResultImage(null);
      setState(prev => ({ ...prev, error: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!sourceImage) return;

    setState({
      isProcessing: true,
      error: null,
      progressMessage: 'Analyzing image and removing text...',
    });

    try {
      const result = await removeTextFromImage(sourceImage);
      setResultImage(result);
      setState(prev => ({ ...prev, isProcessing: false, progressMessage: '' }));
    } catch (err: any) {
      setState({
        isProcessing: false,
        error: err.message || 'Failed to process image.',
        progressMessage: '',
      });
    }
  };

  const reset = () => {
    setSourceImage(null);
    setResultImage(null);
    setState({ isProcessing: false, error: null, progressMessage: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `edited-${sourceImage?.name || 'image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl text-center mb-4">
            Magical Text Removal
          </h2>
          <p className="text-lg text-slate-600 text-center max-w-2xl">
            Clean up your images with AI. Just upload a photo, and our Gemini model will seamlessly remove unwanted text.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Source Image Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Original Image</span>
              {sourceImage && (
                <button onClick={reset} className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Clear
                </button>
              )}
            </div>
            <div className="aspect-[3/4] sm:aspect-[4/5] bg-slate-50 flex items-center justify-center p-4">
              {sourceImage ? (
                <img src={sourceImage.base64} alt="Source" className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-12 h-12 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG, or WebP</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          {/* Result Image Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Cleaned Version</span>
              {resultImage && (
                <button onClick={downloadImage} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download
                </button>
              )}
            </div>
            <div className="aspect-[3/4] sm:aspect-[4/5] bg-slate-50 flex items-center justify-center relative p-4">
              {resultImage ? (
                <img src={resultImage} alt="Result" className="max-h-full max-w-full object-contain rounded-lg shadow-sm animate-in fade-in duration-700" />
              ) : state.isProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium animate-pulse">{state.progressMessage}</p>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                  </div>
                  <p className="text-slate-500">The edited image will appear here.</p>
                </div>
              )}
              
              {state.error && (
                <div className="absolute inset-0 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl max-w-xs text-center shadow-lg">
                    <div className="font-bold mb-1">Processing Error</div>
                    <p className="text-sm">{state.error}</p>
                    <button onClick={() => setState(prev => ({ ...prev, error: null }))} className="mt-2 text-xs font-semibold underline">Dismiss</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Area */}
        {sourceImage && !resultImage && !state.isProcessing && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8">
            <button
              onClick={handleProcessImage}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center space-x-2"
            >
              <span>Remove Text Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Powered by Google Gemini 2.5 Flash Image. High-quality AI background reconstruction.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
